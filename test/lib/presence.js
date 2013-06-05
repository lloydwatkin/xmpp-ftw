require('mocha')
var should   = require('should')
  , Presence = require('../../lib/presence')
  , ltx      = require('ltx')
  , helper   = require('../helper')

describe('Presence', function() {

    var presence
    var socket
    var xmpp

    before(function() {
        socket = new helper.Eventer()
        xmpp = new helper.Eventer()
        var manager = {
            socket: socket,
            client: xmpp
        }
        presence = new Presence()
        presence.init({ socket: socket, client: xmpp })
    })

    describe('Can handle incoming presence updates', function() {
    
        it('Shouldn\'t handle non-presence stanzas', function() {
            presence.handles(ltx.parse('<iq/>')).should.be.false
        })

        it('Should confirm it can handle presence stanzas', function() {
            var item = ltx.parse('<presence />')
            presence.handles(item).should.be.true
        })

        it('Can handle error stanzas', function(done) {
            socket.once('xmpp.presence.error', function(data) {
                data.error.should.equal('gone')
                data.from.user.should.equal('mercutio')
                data.from.domain.should.equal('example.org')
                should.not.exist(data.from.resource) 
                done()
            })
            presence.handle(helper.getStanza('presence/error'))
        })

        it('Can handle subscription requests', function(done) {
            socket.once('xmpp.presence.subscribe', function(data) {
                data.from.user.should.equal('montague')
                data.from.domain.should.equal('example.net')
                should.not.exist(data.from.resource)
                done()
            })
            presence.handle(helper.getStanza('presence/subscribe'))
        })

        it('Can handle another user going offline', function(done) {
            socket.once('xmpp.presence', function(data) {
                data.show.should.equal('offline')
                data.from.user.should.equal('juliet')
                data.from.domain.should.equal('example.com')
                data.from.resource.should.equal('balcony')
                done()
            })
            presence.handle(helper.getStanza('presence/offline'))
        })

        it('Should be able to receive a blank presence stanza', function(done) {
            socket.once('xmpp.presence', function(data) {
                data.from.should.eql({
                    user: 'juliet',
                    domain: 'example.com',
                    resource: 'balcony'
                })
                done()
            })
            presence.handle(helper.getStanza('presence/presence'))
        })
    })
})
