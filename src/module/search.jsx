console.log( "==== sov2ex module: Search ====" )

import TextField from 'textfield';
import Button    from 'button';

/**
 * Result Card
 * 
    <div className="resultcard">
        <div className="title">
            <a href="http://www.v2ex.com/t/367982" target="_blank">
                为了达到完美的阅读模式这个小目标 ，我适配了 120+ 个网站，因此诞生了简悦 - 让你瞬间进入沉浸式阅读的 Chrome 扩展
            </a>
        </div>
        <div className="desc">
            简悦- SimpRead 让你瞬间进入沉浸式阅读的 Chrome 扩展,还原阅读的本质,提升你的阅读体验。 简悦是什么: 简悦是 沉浸式阅读的 Chrome 扩展,取自:「简单阅读,心情...
        </div>
        <div className="details">
            <a href="https://www.v2ex.com/member/kenshin" target="_blank">kenshin</a>
            &nbsp;于&nbsp;
            <span className="date">2017-07-03</span>
            &nbsp;发表，共计&nbsp;
            <span className="replies">154 个回复</span>
        </div>
    </div>
 *
 * @param {object} props 
 */
const ResultCard = props => {
    return (
        <div className="resultcard">
            <div className="title">
                <a href={ `http://www.v2ex.com/t/${props.id}` } target="_blank">
                    { props.title }
                </a>
            </div>
            <div className="desc">
                { props.content }
            </div>
            <div className="details">
                <a href={`https://www.v2ex.com/member/${props.member}`} target="_blank">{props.member}</a>
                &nbsp;于&nbsp;
                <span className="date">{props.created.replace( "T", " " )}</span>
                &nbsp;发表，共计&nbsp;
                <span className="replies">{props.replies} 个回复</span>
            </div>
        </div>
    );
}

/**
 * Empty Card
 */
const EmptyCard = props => {
    return (
        <div className="empty">
            <span className="bg"></span>
            { props.text }
        </div>
    )
}

/**
 * Loading Card
 */
const LoadingCard = () => {
    return (
        <div className="loading">
            <svg className="spinner" width="100" height="100" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                <circle className="path" fill="none" strokeWidth="3" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
            </svg>
        </div>
    )
}

/**
 * Paging divider
 * 
 * @param {object} props 
 */
const PagingHR = props => {
    return (
        <div className="pagingbg" style={ props.style }>
            <div className="paginghr">
                <div className="divider"/>
                <span className="page">{ `第 ${props.page} 页，共计 ${ props.count } 页` }</span>
                <div className="divider"/>
            </div>
        </div>
    )
}

export default class Search extends React.Component {

    static defaultProps = {
        url  : "https://www.sov2ex.com/api/search",
        q    : undefined,
        page : 1,
        size : 10,
        sort : "sumup",
        order: 0,
        gte  : 0,
        lte  : 0,
    }

    static propTypes = {
        page  : React.PropTypes.number,
        size  : React.PropTypes.number,
        order : React.PropTypes.oneOf([ 0, 1 ]),
        sort  : React.PropTypes.oneOf([ "sumup", "created" ]),
    }

    state = {
        cost   : undefined,
        list   : [],
        count  : 0,
        disable: false,
    }

    onClick() {
        this.search( this.refs.search.refs.target.value );
    }

    onKeyDown() {
        event.keyCode == 13 &&
            this.search( event.target.value );
    }

    search( value ) {
        if ( value.trim() != "" ) {
            window.location.href = window.location.origin + window.location.pathname + `?q=${value}`;
        } else {
            new Notify().Render( "不能为空，请输入正确的值。" );
        }
    }

    validation( key, value ) {
        switch ( key ) {
            case "page":
                if ( !/[1-9]+/.test( value ) || value < 1 ) {
                    value = 1;
                    new Notify().Render( 2, "page 参数错误，取值范围最小值为 1 的正整数，请确认。" );
                }
                break;
            case "size":
                if ( !/[1-9]+/.test( value ) || value < 1 || value > 50 ) {
                    value = 10;
                    new Notify().Render( 2, "size 参数错误，取值范围 1 ~ 50 的正整数，请确认。" );
                }
                break;
            case "order":
                if ( ![ 0, 1 ].includes( value )) {
                    value = 0;
                    new Notify().Render( 2, "order 参数错误，取值范围 0 和 1，请确认。" );
                }
                break;
            case "sort":
                if ( ![ "sumup", "created" ].includes( value )) {
                    value = "sumup";
                    new Notify().Render( 2, "sort 参数错误，取值范围 sumup 和 created，请确认。" );
                }
                break;
        }
        return value;
    }

    parse( result ) {
        const count  = Math.floor( result.total / this.props.size ),
              list = this.state.list.concat( result.hits );
        this.setState({
            list,
            cost: {
                took : result.took,
                total: result.total
            },
            disable: this.props.page >= count,
            count: count == 0 ? 1 : count,
        });
    }

    fetch() {
        const page = this.props.page - 1,
              from = page * this.props.size + page;
        $.ajax({
            url     : `${this.props.url}?q=${this.props.q}&sort=${this.props.sort}&order=${this.props.order}&from=${from}&size=${this.props.size}`,
            dataType: "json",
            crossDomain: true,
        })
        .done( result => {
            console.log( result )
            this.parse( result )
        })
        .fail( error => {
            console.error( error )
            new Notify().Render( 2, "当前发生了一些错误，请稍候再使用此服务。" );
        });
    }

    onClick() {
        this.props.page++;
        if ( this.props.page > this.state.count ) {
            this.setState({ disable: true });
            new Notify().Render( "当前已经是最后一页。" );
        } else {
            this.fetch();
            /page=\d+/.test( window.location.search ) &&
                history.pushState( "", "", window.location.search.replace( /page=\d+/, `page=${this.props.page}` ) );
        }
    }

    componentWillMount() {
        if ( location.search.startsWith( "?q=" ) ) {
            const query = window.location.search.replace( "?", "" ).split( "&" );
            query && query.length > 0 && query.forEach( item => {
                const [ key, value ] = item.split( "=" );
                this.props[key]      = this.validation( key, value );
            });
            this.props.q != "" && this.fetch();
            this.props.q != "" && $( "head title" ).text( `${decodeURI( this.props.q )} - SOV2EX 搜索结果` );
        } else {
            new Notify().Render( "搜索发送了错误，请重新打开本页。" );
        }
    }

    render() {

        let hidden = false, list = this.state.list.map( item => {
            return <ResultCard { ...item._source } />
        });

        if ( !this.state.cost ) {
            hidden = true;
            list   = <LoadingCard />;
        }
        else if ( this.state.cost.total == 0 ) {
            hidden = true;
            list   = <EmptyCard text="Oops~ 并未搜索到任何内容，请重新确认搜索关键字!"/>;
        } else if ( this.props.page > this.state.count ) {
            hidden = true;
            list   = <EmptyCard text={ `关键字：${this.props.q} 查询结果共有 ${this.state.count} 页，已超过最大页数，请重新确认。` } />;
        }

        return (
            <div className="searchpage" style={{ "height" : hidden ? "100%" : "auto" }}>
                <div className="top">
                    <div className="logo">
                        <a href="./">
                            <img src="./assets/images/logo@1x.png"></img>
                        </a>
                    </div>
                    <div className="searchbar">
                        <div className="search">
                            <TextField 
                                ref="search" 
                                value={ decodeURI( this.props.q ) }
                                placeholder="请输入查询的关键字" 
                                onKeyDown={ ()=>this.onKeyDown() }
                            />
                            <span className="bar" onClick={ ()=> this.onClick() }></span>
                        </div>
                    </div>
                    <div className="placeholder"></div>
                </div>
                <div className="cost" style={{ visibility: hidden ? "hidden" : "visible" }}>
                    <span>共计 { this.state.cost && this.state.cost.total} 个结果，耗时 {this.state.cost && this.state.cost.took} 毫秒</span>
                </div>
                <div className="searchresults" style={{ "height" : hidden ? "100%" : "auto" }}>
                    { list }
                </div>
                <PagingHR page={ this.props.page } count={ this.state.count } style={{ visibility: hidden ? "hidden" : "visible" }} />
                <div className="paging" style={{ visibility: hidden ? "hidden" : "visible" }}>
                    <Button type="raised" text={ !this.state.disable ? "加载更多" : "已全部加载完毕" }
                        disable={ this.state.disable }
                        color="#fff" backgroundColor="rgba(3, 169, 244, 1)"
                        waves="md-waves-effect md-waves-button"
                        onClick={ ()=>this.onClick() }
                    />
                </div>
                <div className="footer">
                    <div className="groups">
                        <div className="links">
                            <a href="./" className="logo">
                                <img src="./assets/images/logo@1x.png"></img>
                            </a>
                            <ul>
                                <li><a target="_blank" href="http://service.weibo.com/share/share.php?url=https://sov2ex.com&title=SOV2EX - 一个便捷的 v2ex 站内搜索引擎"><span className="icon weibo"></span></a></li>
                                <li><a target="_blank" href="https://www.douban.com/share/service?href=https://sov2ex.com&name=SOV2EX - 一个便捷的 v2ex 站内搜索引擎"><span className="icon douban"></span></a></li>
                                <li><a target="_blank" href="https://twitter.com/intent/tweet?text=SOV2EX - 一个便捷的 v2ex 站内搜索引擎&url=https://sov2ex.com"><span className="icon twitter"></span></a></li>
                                <li><a target="_blank" href="https://www.facebook.com/sharer.php?u=https://sov2ex.com"><span className="icon facebook"></span></a></li>
                                <li><a target="_blank" href="https://plus.google.com/share?url=https://sov2ex.com"><span className="icon gplus"></span></a></li>
                                <li><a target="_blank" href="https://t.me/share/url?url=https://sov2ex.com"><span className="icon telegram"></span></a></li>
                            </ul>
                        </div>
                        <div className="links">
                            <h2>链接</h2>
                            <a href="https://github.com/Bynil/sov2ex" target="_blank">关于</a>
                            <a href="https://github.com/Bynil/sov2ex" target="_blank">API 文档</a>
                            <a href="https://github.com/Bynil/sov2ex/issues" target="_blank">提交问题</a>
                        </div>
                    </div>
                    <div className="copywrite">
                        <span>SOV2EX - 一个便捷的 v2ex 站内搜索引擎</span> <span>&nbsp;©&nbsp;2017 <a href="https://sov2ex.com">sov2ex.com</a> by <a href="http://www.gexiao.me/" target="_blank">默默</a> & <a href="http://kenshin.wang" target="_blank">Kenshin Wang</a></span>
                    </div>
                </div>
            </div>
        )
    }
}