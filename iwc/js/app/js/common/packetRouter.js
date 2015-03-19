/**
 *
 * @class packetRouter
 * @namespace ozpIwc
 * @static
 */
ozpIwc.packetRouter = ozpIwc.packetRouter || {};

/**
 * Generates a template function to deserialize a uri string based on the RegExp pattern provided.
 *
 * @method uriTemplate
 * @static
 * @param {String} pattern
 * @returns {Function} If the uri does not meet the template criteria, null will be returned when the returned
 *                     function is invoked.
 */
ozpIwc.packetRouter.uriTemplate=function(pattern) {
  var fields=[];
  var regex=new RegExp("^"+pattern.replace(/\{.+?\}|[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, function(match) {
      if(match.length===1) {
          return "\\"+match;
      }
      var spec=match.slice(1,-1).split(":",2);
      fields.push(spec[0]);
      if(spec[1]) {
          return "("+spec[1]+")";
      } else {
        return "([^\/]+)";
      }
  })+"$");
  
  return function(input) {
     var results=regex.exec(input);
     if(!results) {
         return null;
     }
     var obj={};
     for(var i=1;i<results.length;++i) {
         obj[fields[i-1]]=results[i];
     }
     return obj;
  };
    
};

/**
 * A routing module for packet controlling via template matching and filtering.
 * @class PacketRouter
 * @namespace ozpIwc
 */
ozpIwc.PacketRouter=function() {
    /**
     * The key on this table is the route action.
     * The value is an array of config objects of the form:
     *    action: from the route declaration
     *    resource: from the route declaration
     *    handler: the function from the route declaration
     *    uriTemplate: uriTemplate function
     * @property routes
     * @type {Object}
     */
    this.routes={};

    /**
     * The route that matches all packet handling requests. Should defined route be able to handle a packet, this route
     * is called. Can be changed using the declareDefaultRoute method.
     *
     * @property defaultRoute
     * @returns {*}
     */
    this.defaultRoute=function() { return false;};

    /**
     * The default scope of the router.
     * @type {PacketRouter}
     */
    this.defaultSelf=this;
};


/**
 * Assigns a route to the Packet Router for the specific action. This route is taken by a packet if its resource matches
 * the routes resource template, passes any assigned filters. Additionally, a packet may only take one route, if
 * multiple possible routes are possible, the route which was declared earliest will handle the packet.
 *
 * @method declareRoute
 * @param {Object} config
 * @param {String} config.action The action this route is defined to (ex. "get", "set", "list", ...)
 * @param {String} config.resource The serialized uri template definition pertaining to the route (ex. "/foo", "/{id:\\d+}", "/{param1}/{param2}")
 * @param {Array} config.filters Any filters that better isolate the packet routing based on the context and packet properties
 * @param {Function} handler The resulting action to be taken should this route handle a packet.
 * @param {Object}handlerSelf The scope of the handler, the PacketRouter object holds the default scope if none is provided.
 *
 * @returns {ozpIwc.PacketRouter}
 */
ozpIwc.PacketRouter.prototype.declareRoute=function(config,handler,handlerSelf) {
    if(!config || !config.action || !config.resource) {
        throw new Error("Bad route declaration: "+JSON.stringify(config,null,2));
    }
    var actionRoute=this.routes[config.action];
    if(!actionRoute) {
        actionRoute=this.routes[config.action]=[];
    }
    
    config.handler=handler;
    config.filters=config.filters || [];
    config.handlerSelf=handlerSelf || this.defaultSelf;
    config.uriTemplate=ozpIwc.packetRouter.uriTemplate(config.resource);
    actionRoute.push(config);
    return this;
};

/**
 * Recursively passes through all filters for the packet, calling the handler only if all filters pass.
 *
 * @method filterChain
 * @param {Object} packet
 * @param {Object} context
 * @param {Object} pathParams
 * @param {Object} routeSpec
 * @param {Array} filters
 * @returns {Function|null} The handler function should all filters pass.
 */
ozpIwc.PacketRouter.prototype.filterChain=function(packet,context,pathParams,routeSpec,filters) {
  if(!filters.length) {
    return routeSpec.handler.call(routeSpec.handlerSelf,packet,context,pathParams);
  }
  var f=filters.shift();
  var self=this;
  return f(packet,context,pathParams,function() {
    return self.filterChain(packet,context,pathParams,routeSpec,filters);
  });
};

/**
 * Routes the given packet based on the context provided.
 *
 * @method routePacket
 * @param {Object} packet
 * @param {Object} context
 * @returns {*|false} The output of the route's handler. If the specified action does not have any routes false is
 *                    returned. If the specified action does not have a matching route the default route is applied
 */
ozpIwc.PacketRouter.prototype.routePacket=function(packet,context) {
    context=context || {};
    var actionRoutes=this.routes[packet.action];
    if(!actionRoutes) {
        return false;
    }
    for(var i=0;i<actionRoutes.length;++i) {
        var route=actionRoutes[i];
        var pathParams=route.uriTemplate(packet.resource);
        if(pathParams) {
            var filterList=route.filters.slice();
            return this.filterChain(packet,context,pathParams,route,filterList);
        }
    }
    return this.defaultRoute(packet,context,{});
    
};

/**
 * Assigns the default route for the Packet Router
 *
 * @param {Function} handler
 */
ozpIwc.PacketRouter.prototype.declareDefaultRoute=function(handler) {
    this.defaultRoute=handler;
};