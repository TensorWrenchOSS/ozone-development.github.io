/**
 * ```
    .---------------------------.
   /,--..---..---..---..---..--. `.
  //___||___||___||___||___||___\_|
  [j__ ######################## [_|
     \============================|
  .==|  |"""||"""||"""||"""| |"""||
 /======"---""---""---""---"=|  =||
 |____    []*  IWC     ____  | ==||
 //  \\        BUS    //  \\ |===||  hjw -(& kjk)
 "\__/"---------------"\__/"-+---+'
 * ```
 * @module bus
 */

/**
 * Classes related to api aspects of the IWC.
 * @module bus
 * @submodule bus.api
 */
/**
 * The API classes that can be used on the IWC bus. All of which subclass {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}
 * @module bus.api
 * @submodule bus.api.Type
 */
/**
 * The API Value types that can be used in IWC apis. All of which subclass
 * {{#crossLink "CommonApiValue"}}{{/crossLink}}
 * @module bus.api
 * @submodule bus.api.Value
 */

/**
 * @TODO (Describe ApiError)
 *
 * @class ApiError
 * @namespace ozpIwc
 * @constructor
 *
 * @type {Function}
 * @param {String} action The action of the error.
 * @param {String} message The message corresponding to the error.
 */
ozpIwc.ApiError=ozpIwc.util.extend(Error,function(action,message) {
    Error.call(this,message);
    this.name="ApiError";
    this.errorAction=action;
    this.message=message;
});