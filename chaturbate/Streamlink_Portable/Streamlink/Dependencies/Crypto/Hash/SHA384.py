# -*- coding: utf-8 -*-
#
# ===================================================================
# The contents of this file are dedicated to the public domain.  To
# the extent that dedication to the public domain is not available,
# everyone is granted a worldwide, perpetual, royalty-free,
# non-exclusive license to exercise all rights associated with the
# contents of this file for any purpose whatsoever.
# No rights are reserved.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
# BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
# ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
# ===================================================================

from Crypto.Util.py3compat import *

from Crypto.Util._raw_api import (load_pycryptodome_raw_lib,
                                  VoidPointer, SmartPointer,
                                  create_string_buffer,
                                  get_raw_buffer, c_size_t,
                                  expect_byte_string)

_raw_sha384_lib = load_pycryptodome_raw_lib("Crypto.Hash._SHA384",
                        """
                        int SHA384_init(void **shaState);
                        int SHA384_destroy(void *shaState);
                        int SHA384_update(void *hs,
                                          const uint8_t *buf,
                                          size_t len);
                        int SHA384_digest(const void *shaState,
                                          uint8_t digest[48]);
                        int SHA384_copy(const void *src, void *dst);
                        """)

class SHA384Hash(object):
    """A SHA-384 hash object.
    Do not instantiate directly. Use the :func:`new` function.

    :ivar oid: ASN.1 Object ID
    :vartype oid: string

    :ivar block_size: the size in bytes of the internal message block,
                      input to the compression function
    :vartype block_size: integer

    :ivar digest_size: the size in bytes of the resulting hash
    :vartype digest_size: integer
    """

    # The size of the resulting hash in bytes.
    digest_size = 48
    # The internal block size of the hash algorithm in bytes.
    block_size = 128
    # ASN.1 Object ID
    oid = '2.16.840.1.101.3.4.2.2'

    def __init__(self, data=None):
        state = VoidPointer()
        result = _raw_sha384_lib.SHA384_init(state.address_of())
        if result:
            raise ValueError("Error %d while instantiating SHA384"
                             % result)
        self._state = SmartPointer(state.get(),
                                   _raw_sha384_lib.SHA384_destroy)
        if data:
            self.update(data)

    def update(self, data):
        """Continue hashing of a message by consuming the next chunk of data.

        Args:
            data (byte string): The next chunk of the message being hashed.
        """

        expect_byte_string(data)
        result = _raw_sha384_lib.SHA384_update(self._state.get(),
                                               data,
                                               c_size_t(len(data)))
        if result:
            raise ValueError("Error %d while instantiating SHA384"
                             % result)

    def digest(self):
        """Return the **binary** (non-printable) digest of the message that has been hashed so far.

        :return: The hash digest, computed over the data processed so far.
                 Binary form.
        :rtype: byte string
        """

        bfr = create_string_buffer(self.digest_size)
        result = _raw_sha384_lib.SHA384_digest(self._state.get(),
                                               bfr)
        if result:
            raise ValueError("Error %d while instantiating SHA384"
                             % result)

        return get_raw_buffer(bfr)

    def hexdigest(self):
        """Return the **printable** digest of the message that has been hashed so far.

        :return: The hash digest, computed over the data processed so far.
                 Hexadecimal encoded.
        :rtype: string
        """

        return "".join(["%02x" % bord(x) for x in self.digest()])

    def copy(self):
        """Return a copy ("clone") of the hash object.

        The copy will have the same internal state as the original hash
        object.
        This can be used to efficiently compute the digests of strings that
        share a common initial substring.

        :return: A hash object of the same type
        """

        clone = SHA384Hash()
        result = _raw_sha384_lib.SHA384_copy(self._state.get(),
                                             clone._state.get())
        if result:
            raise ValueError("Error %d while copying SHA384" % result)
        return clone

    def new(self, data=None):
        """Create a fresh SHA-384 hash object."""

        return SHA384Hash(data)

def new(data=None):
    """Create a new hash object.

    :parameter data:
        Optional. The very first chunk of the message to hash.
        It is equivalent to an early call to :meth:`SHA384Hash.update`.
    :type data: byte string

    :Return: A :class:`SHA384Hash` hash object
    """

    return SHA384Hash().new(data)

# The size of the resulting hash in bytes.
digest_size = SHA384Hash.digest_size

# The internal block size of the hash algorithm in bytes.
block_size = SHA384Hash.block_size

