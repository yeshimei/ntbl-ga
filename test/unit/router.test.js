import assert from 'assert'
import { stdout } from "test-console"
import Ga from '../../dist/ga.es'
import { sendKey, wait } from '../utils' 

function router (app) {
  return {
    routes: [
      {
        path: '/',
        component: 'homepage',
      },
      {
        path: '/a',
        component: 'string'
      },
      {
        path: '/b',
        component: () => 'string'
      },
      {
        path: '/c',
        component: async () => {
          await wait()
          return 'string'
        }
      },
      {
        path: '/d',
        component: () => console.log('string')
      },
      {
        path: ['/e', '/f'],
        component: 'multiple path'
      },
      {
        path: '/g',
        jump: 'alt+a',
        component: 'jump'
      },
      {
        path: '/h',
        jump: ['alt+b', 'alt+c'],
        component: 'multiple jump'
      },
    ]
  }
}

describe('Router', () => {
  let app

  beforeEach(async () => {
    Ga.config.test = true
    app = new Ga({ router })
    await app.$mount()
  })

  afterEach(() => {
    app.$terminal.pause()
  })

  describe('路由组件', () => {
    it('- 字符串', async () => {
      await app.$router.push('/a')
      assert.equal(app.$route.template, 'string')
    })
  
    it('- 普通函数', async () => {
      await app.$router.push('/b')
      assert.equal(app.$route.template, 'string')
    })
  
    it('- 异步函数', async () => {
      await app.$router.push('/c')
      assert.equal(app.$route.template, 'string')
    })
    
    it('- 组件未返回内容时，由用户自定义输出内容', async () => {
      Ga.config.test = false
      const inspect = stdout.inspect()
      await app.$router.push('/d')
      inspect.restore()
      assert.equal(inspect.output[0], 'string\n')
    })
  })

  describe('通过 path 切换页面', () => {
    it('一个 ', async () => {
      await sendKey(app, 'a')
      assert.equal(app.$route.template, 'string')
    })

    it('多个', async () => {
      await sendKey(app, 'e')
      assert.equal(app.$route.template, 'multiple path')
      await sendKey(app, 'f')
      assert.equal(app.$route.template, 'multiple path')
    })
  })
  
  describe('通过 jump 切换页面', () => {
    it('一个', async () => {
     
    })

    it('多个', async () => {
     
    })
  })
})

