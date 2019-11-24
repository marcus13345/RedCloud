import random
import re

from streamlink.plugin import Plugin
from streamlink.plugin.api import http
from streamlink.stream import HLSStream

try:
    from websocket import create_connection
    HAS_WEBSOCKET = True
except ImportError:
    HAS_WEBSOCKET = False

DATA_URL = "https://www.myfreecams.com/php/modelobject.php?f={0}&s={1}"
HLS_VIDEO_URL = "http://video{0}.myfreecams.com:1935/NxServer/ngrp:mfc_{1}.f4v_mobile/playlist.m3u8"
WEBSOCKET_SERVERS = [7, 8, 9, 10, 11, 12, 20, 22, 23, 24, 25, 26, 27, 28, 29, 39]

_session_re = re.compile(r"\173\04522fileno\04522\:\04522(?P<session>[\d_]+)\04522\175")
_url_re = re.compile(r"https?\:\/\/(?:\w+\.)?myfreecams\.com\/(?:\#(?P<username>\w+)|id\=(?P<user_id>\d+))")
# USERNAME URL = https://www.myfreecams.com/#UserName
# CUSTOM ID URL = https://www.myfreecams.com/id=01234567


class MyFreeCams(Plugin):
    @classmethod
    def can_handle_url(cls, url):
        return _url_re.match(url)

    def _get_streams(self):
        match = _url_re.match(self.url)
        username = match.group("username")
        user_id = match.group("user_id")

        if not HAS_WEBSOCKET:
            self.logger.error("websocket-client is not installed")
            self.logger.info("You can install it with:")
            self.logger.info("pip install websocket-client")
            self.logger.info("https://pypi.python.org/pypi/websocket-client")
            return

        # https://www.myfreecams.com/_js/serverconfig.js
        xchat = "xchat{0}".format(random.choice(WEBSOCKET_SERVERS))
        ws_host = "wss://{0}.myfreecams.com/fcsl".format(xchat)
        ws = create_connection(ws_host)

        # https://www.myfreecams.com/js/wsgw.js
        # https://www.myfreecams.com/js/FCS.js
        send_msg_hello = "hello fcserver\n\0"
        # FCTYPE_LOGIN = 1
        send_msg_login = "1 0 0 20071025 0 guest:guest\n\0"
        send_msg_ping = "1 0 0 0 0\n\0"
        # FCTYPE_LOGOUT = 99
        send_msg_logout = "99 0 0 0 0"

        ws.send(send_msg_hello)
        ws.send(send_msg_login)

        loop_number = 0
        status_regex = False
        while status_regex is not True:
            if loop_number is 20:
                # quit script after 20 trys
                self.logger.error("Is your connection ok?")
                return

            # send message to the websocket server
            ws.send(send_msg_ping)
            data_ws = ws.recv()

            try:
                mfc_session = _session_re.search(data_ws)
                mfc_session = mfc_session.group("session")

                if mfc_session is not None:
                    status_regex = True
            except:
                loop_number += 1
                self.logger.debug("-- RESEND WEBSOCKET DATA -- {0} --".format(loop_number))

        ws.send(send_msg_logout)
        ws.close()

        if username:
            re_uid = r"\d+"
            re_username = username
        elif user_id:
            re_uid = int(user_id)
            re_username = r"\w+"

        # regex for http data
        _data_channel_re = re.compile(r"""
            \"nm\"\:\"(?P<username>{0})\"\,
            [^\173\175]+
            \"uid\"\:(?P<uid>{1})\,
            \"vs\"\:(?P<vs>\d+)\,
            [^\173\175]+
            \173
            [^\173\175]+
            \"camserv\"\:(?P<server>\d+)
            """.format(re_username, re_uid), re.VERBOSE | re.IGNORECASE)

        # get data from http server
        cookies = {"cid": "3149", "gw": "1"}
        res = http.get(DATA_URL.format(mfc_session, xchat), cookies=cookies)
        data_channel = _data_channel_re.search(res.text)

        if not data_channel:
            # abort if the regex can't find the username
            self.logger.error("Stream is offline or username/user_id is invalid")
            return

        username = data_channel.group("username")
        uid = int(data_channel.group("uid"))
        uid_video = uid + 100000000
        vs = int(data_channel.group("vs"))
        camserver = int(data_channel.group("server"))

        self.logger.info("USER ID: {0}".format(uid))
        self.logger.info("USERNAME: {0}".format(username))
        self.logger.debug("VIDEO STATUS: {0}".format(vs))

        if vs is 0:
            # FCVIDEO_TX_IDLE = 0
            if camserver >= 840:
                server = camserver - 500
            elif camserver < 839:
                server = 0

            if server:
                hls_url = HLS_VIDEO_URL.format(server, uid_video)

                self.logger.debug("HLS URL: {0}".format(hls_url))

                for s in HLSStream.parse_variant_playlist(self.session, hls_url).items():
                    yield s

__plugin__ = MyFreeCams