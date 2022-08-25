module.exports = {
  lifeCycles:{
    componentDidMount:{
      rax:'componentDidMount'
    },
    render:{
      rax:'render'
    },
    
    constructor:{
      rax:'constructor'
    },

    componentWillMount:{
      rax:'componentWillMount'
    },

    componentDidUpdate:{
      rax:'componentDidUpdate',
    },

    componentWillUnmount:{
      rax:'componentWillUnmount'
    },

    componentWillReceiveProps:{
      rax:'componentWillReceiveProps'
    },
    
    shouldComponentUpdate:{
      rax:'shouldComponentUpdate'
    },
    componentDidCatch:{
      rax:'componentDidCatch'
    }
  },
    
    // 子节点需要进行分离，生成一个函数节点
    hocExportNodes:['Tabheader','List','MutiFloor','LightCardMutiFloor','XSlider','Slider','Waterfall'],

    // 初始化函数名
    initMethodName:"__initMethod__",

    datasourceHooks:['willFetch','didFetch','dataHandler','errorHandler','shouldFetch'],

    // 数据属性
    dataPropsNodes: ['List', 'MutiFloor'],

    //某些组件在转化的时候会有默认属性,这些属性是必要的，但是在搭建的时候不需要用户感知
    defaultPropsMap:{
      LightCardView:{
        datasource:'item',
        cardIndex:'index',
        extParam:'extParam'
      }
    }
}
