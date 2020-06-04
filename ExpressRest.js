/**
 * Created by asael on 29/05/20.
 */

function ExpressRest(configuration){
    let _globalToken=function(){

    };
    let rest={
        routes:{
            Create:{
                ajax:{
                    url:"local/create",
                    method:"POST",
                }
                //, trigger:{
                //     query: $(".agregar_seccion"),
                //     params: {
                //         test:123
                //     },
                //     data: new dataAdapter(function (query) {
                //         return query.serializeArray();
                //     })
                // }
            },
            Read:{
                ajax:{
                    url:"",
                    method:"GET",
                }
            },
            Update:{
                ajax:{
                    url:"",
                    method:"GET",
                }
            },
            Delete:{
                ajax:{
                    url:"",
                    method:"GET",
                }
            }
        },
        globals:{
            data:{
                query: "",
                get:function (query) {
                    return  query.serializeJson();
                }
            },
            token:{
                type:"X-XSRF-TOKEN",
                value:function () {
                    let cookie=Cookies.get("XSRF-TOKEN");
                    return decodeURIComponent(cookie);
                }
            },
            events:{

                success:function () {

                },
                complete:function () {
                    console.log("COMPLTE");
                },
                error:function () {
                    console.log("ha ocurrido un error");
                }
            }

        }
    };
    if(!!configuration){

        rest.routes={
            ...rest.routes,...configuration.routes
        };

        rest.globals.data={
            ...rest.globals.data,...configuration.globals.data
        };

        rest.globals.token={
            ...rest.globals.token,...configuration.globals.token
        };

        rest.globals.events={
            ...rest.globals.events,...configuration.globals.events
        };

    }

    rest.ajax=function (nameRoute,...params) {
        let _route=rest.routes[nameRoute];
        if(!!_route){
            if(!!params){
                let _ajax={
                    ..._route.ajax, ...params
                };
                return new requestAdapter(_ajax)
            }
            return new requestAdapter(_route.ajax);
        }else{
            console.log("Ruta no encontrada");
        }
    };



    rest.request=function (nameRoute,_request) {

        let _route=rest.routes[nameRoute];
        if(!!_route){
            if(!!_request){
                let _ajax={
                    ..._route.ajax, ..._request
                };
                return new requestAdapter(_ajax)
            }
            return new requestAdapter(_route.ajax);
        }
    };

    rest.init=function () {
        for(let route in rest.routes){
            rest.request(route);
            let trigger=rest.routes[route].trigger || null;
            if(!!trigger){
                let handler=function () {
                    rest.request(route).ajax();
                };
                trigger.handler=handler;
                console.log(trigger.handler);
                rest.routes[route].Trigger=new triggerAdapter(trigger);

            }

        }
    };

    function requestAdapter(ajax){

        this.method=ajax.method ||'GET';
        this.url=ajax.url;
        this.data=ajax.data || new dataAdapter(rest.globals.data);
        this.token=ajax.token || new tokenAdapter(rest.globals.token);
        this.success=ajax.success || rest.globals.events.success;
        this.error=ajax.error || rest.globals.events.error;
        this.complete=ajax.complete || rest.globals.events.complete;
        this.headers=ajax.headers||{};
        this._request={
            method: this.method,
            url: this.url,
            success: this.success,
            error: this.error,
            complete:this.complete,
        };


        this.getHeaders=function () {
            let _headers={};
            if(this.method==="POST"){
                _headers={
                    ...this.headers,...(this.getToken())
                };
            }
            return _headers;
        };

        this.getToken=function () {
            if(this.token instanceof tokenAdapter){
                return this.token.getToken();
            }
            else{
                return this.token;
            }
        };

        this.getData=function () {
            if(this.data instanceof dataAdapter){

                return this.data.getAllData();
            }
            console.log(this.data);
            return this.data;
        };

        this.getRequest=function () {

            this._request.data=this.getData();
            this._request.headers=this.getHeaders();
            return this._request;
        };

        this.ajax=function () {
            console.log(this.getRequest());
            $.ajax(this.getRequest());
        };
    }

    function dataAdapter(data){
        this.query=data.query;
        this.get=data.get || {};
        this.params=data.params || {};

        this.getAllData=function () {
            let _data={};
            _data={
                ...this.getData(), ...this.params
            };
            return _data;
        };
        this.getData=function () {
            return this.get(this.query);
        };

    }

    function tokenAdapter(token){
        this.type=token.type;
        this.value=token.value;

        this.getToken=function () {
            let _token={};
            _token[this.type]=this.value();
            return _token;
        };
    }

    function triggerAdapter(trigger){

        this.query=trigger.query;
        this.data=trigger.data instanceof dataAdapter ? trigger.data : null;
        this.events=trigger.events || 'click';
        this.selector=trigger.selector || null;
        this.handler=trigger.handler || null;



        this.getData=function(){
            if(!!this.data){
                return this.data.getAllData();
            }
            return null;
        };

        this.getTrigger=function () {
            return this.trigger;
        };

        this.fire=function () {
            this.query.trigger(this.events);
        };

        this.trigger=this.query.on(this.events, this.selector,this.getData(),this.handler);

    }

    return rest;
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

(function ( $ ) {


    $.fn.serializeJson=function (){
        let _array=this.serializeArray();
        let data={};
        for (const item of _array) {
            data[item.name]=item.value;
        }
        return data;
    }

}( jQuery ));


