import assert from 'assert'
import { stdout } from "test-console"
import Ga from '../../dist/ga.es'

function router (app) {
  return {
    routes: [
      {
        name: 'name',
        path: '/',
        component: 'homepage',
      },
      {
        name: 'help',
        path: '/h',
        component: 'help page',
      },
      {
        name: 'star',
        path: '/s',
        component: 'star page',
      },
      {
        name: 'help-a',
        path: '/h/a',
        component: 'help-A page',
      },
      {
        name: 'keys',
        path: '/alt+shift+ctrl+k',
        component: 'keys page'
      }
    ]
  }
}


function addOk (app) {
  app.$event.on('render', route => {
    route.template += ' ok'
  })
}


describe('Api', () => {
  let app

  beforeEach(async () => {
    Ga.config.test = true

    app = new Ga({ router })
    await app.$mount()
  })

  afterEach(() => {
    app.$terminal.pause()
  })

  describe('Ga', () => {
    it('使用插件', async () => {
      Ga.config.test = true
      app = new Ga({ 
        router,
        plugins: [ addOk ]
      })
      await app.$mount()
      
      assert.equal(app.$route.template, 'homepage ok')
    })
  })

  describe('$route', () => {
    it('path', async () => {
      await app.$router.push('/h')
      assert.equal(app.$route.path, '/h')
    })

    it('key and keys', async () => {
      await app.$router.push('keys')
      assert.equal(app.$route.key, 'alt+shift+ctrl+k')
      assert.deepEqual(app.$route.keys, {
        name: 'k',
        shift: true,
        ctrl: true,
        alt: true
      })
    })

    it('route', async () => {
      assert.equal(app.$route.route, app.$router.routes[0])
    })
 })


  describe('$router', () => {
    it('push() - 根据路径切换', async () => {
      await app.$router.push('/h')
      assert.equal(app.$route.template, 'help page')
    })

    it('push() - 根据名字切换', async () => {
      await app.$router.push('help')
      assert.equal(app.$route.template, 'help page')
    })

    it('push() - 忽略未匹配到的路径或名字', async () => {
      await app.$router.push('/k')
      assert.equal(app.$route.path, '/')

      await app.$router.push('ga')
      assert.equal(app.$route.path, '/')
    })

    it('back()', async () => {
      await app.$router.push('/h')
      await app.$router.back()
      assert.equal(app.$route.path, '/')
    })

    it('forward()', async () => {
      await app.$router.push('/h')
      await app.$router.back()
      await app.$router.forward()
      assert.equal(app.$route.path, '/h')
    })

    it('go()', async () => {
      await app.$router.push('/h')
      await app.$router.push('/h/a')
      await app.$router.go(-2)
      assert.equal(app.$route.path, '/')
      await app.$router.go(2)
      assert.equal(app.$route.path, '/h/a')
    })
  })

  describe('$terminal', () => {
    it('clear()', () => {
      Ga.config.test = false
      const inspect = stdout.inspect()
      app.$terminal.clear()
      inspect.restore()
      assert.equal(inspect.output[0], '\x1B[2J',)
    })
  })
})