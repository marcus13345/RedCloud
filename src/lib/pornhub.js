var cheerio = require("cheerio"),
    https = require("https"),
    http = require("http"),
    qs = require("querystring"),
    URL = require("url");

var request = require('request');

var Entities = require('html-entities').XmlEntities;
 
var html_entities = new Entities();

var PornHub = module.exports;
var videoEmbedUrl = ({video_id}) => `http://www.pornhub.com/webmasters/video_embed_code?id=${video_id}`;
var videoInfoUrl = ({video_id, size}) => `http://www.pornhub.com/webmasters/video_by_id?id=${video_id}&thumbsize=${size}`;

PornHub.resolveId = function resolveId(id, cb) {
  if (typeof id !== "number") {
    return cb(Error("wrong type for id; expected number but got " + typeof id));
  }

  var get_info_url = videoInfoUrl({video_id: id, size: 'large_hd'});

  var req = http.get(get_info_url, function(res) {
    if (res.statusCode === 404) {
      return cb(Error("video not found"));
    }

    if (res.statusCode !== 301) {
      return cb(Error("incorrect status code; expected 301 but got " + res.statusCode));
    }

    return cb(null, res.headers.location);
  });

  req.once("error", cb);
};

PornHub.details = function details(url, cb) {
  var url_parsed = URL.parse(url, true);
  var video_id = url_parsed.query.viewkey;
  var url_opts = {
    video_id: video_id,
    size: 'large_hd'
  };

  var video_embed = videoInfoUrl(url_opts);
  
  var get_info_url = videoInfoUrl(url_opts);
  var get_embed_url = videoEmbedUrl(url_opts);

  request.get(get_info_url, function(err, res, body) {
      if (err) {
        return cb(err);
      }
      // console.log('res', res);
      if (res.statusCode === 404) {
        return cb(Error("pornhub: video not found"));
      }

      if (res.statusCode !== 200) {
        return cb(Error("pornhub: incorrect status code; expected 200 but got " + res.statusCode));
      }

      var data = body;
      if (typeof body === 'string') {
        data = JSON.parse(body);
      }

      // console.log('body', body);

      var title;
      if(!('video' in data)) return cb("unknown error", null)
      title = data.video.title;

      var duration;
      duration = data.video.duration;

      var tags = [];
      for (var i = data.video.tags.length - 1; i >= 0; i--) {
        var tag = data.video.tags[i];
        tags.push(tag.tag_name);
      };

      var thumb;
      thumb = data.video.default_thumb;

      request.get(get_embed_url, function(err, res, body) {
        var data = body;
        if (typeof body === 'string') {
          data = JSON.parse(body);
        }

        // console.log("data", JSON.stringify(data, null, 2));

        var html;
        if (data.embed && data.embed.code) {
          html = html_entities.decode(data.embed.code);
        }
        return cb(null, {title: title, duration: duration, tags: tags, thumb: thumb, html: html}); 
      });

  });
};

PornHub.constructSearchUrl = function constructSearchUrl(parameters) {
  return "https://www.pornhub.com/webmasters/search?" + qs.stringify(parameters);
};

PornHub.search = function search(parameters, cb) {
  var req = https.get(this.constructSearchUrl(parameters), function(res) {
    var body = Buffer(0);

    res.on("readable", function() {
      var chunk;
      while (chunk = res.read()) {
        body = Buffer.concat([body, chunk]);
      }
    });


    if (res.statusCode !== 200) {
      return cb(Error("incorrect status code; expected 200 but got " + res.statusCode));
    }

    res.on("end", function() {
      body = body.toString("utf8");
      
      videos = JSON.parse(body).videos.map(v => { return {
        vid: v.video_id,
        title: v.title,
        tags: v.tags.map(v => v.tag_name),
        duration: v.duration,
        thumbnail: v.thumbs[0].src
      }})

      return cb(null, videos);
    });
  });

  req.once("error", cb);
};
