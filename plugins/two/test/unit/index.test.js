import Ga from '@ntbl/ga'
import options from '../../package.json'
import two from '../../src/index'

function router () {
  return {
    routes: [
      { path: '/', name: 'home', jump: 'alt+x', alias: '首页', component: 'homepage'},
      { path: '/s', name: 'star', alias: '收藏', component: 'stat page'},
      { path: '/c', name: 'comment', alias: '评论', component: 'comment page'},
    ]
  }
}

Ga.config.test = true

describe('two', () => {
  let app 
  beforeEach(async () => {
    app = new Ga({
      router,
      plugins: [ two(options) ]
    })
    
    await app.$mount()
  })

  test('顶部 logo 和面包屑导航', async () => {
    expect(app.$route.template).toContain('● @ntbl/ga-two 首页')
    await app.$router.push('/s')
    expect(app.$route.template).toContain('● @ntbl/ga-two 首页/收藏')
    
  })

  test('底部菜单', async () => {
    expect(app.$route.template).toContain('收藏[s] | 评论[c]')
    expect(app.$route.template).toContain('首页(alt+x)')
    await app.$router.push('/s')
    expect(app.$route.template).toContain('返回[ESC]')
    expect(app.$route.template).toContain('首页(alt+x)')
  })
})
