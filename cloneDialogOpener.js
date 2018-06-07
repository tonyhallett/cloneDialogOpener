//need intellisense for this - typescript ?
(function ( $ ) {
    //#region copy css
    $.fn.getStyles = function(only, except) {
		
		// the map to return with requested styles and values as KVP
		var product = {};
		
		// the style object from the DOM element we need to iterate through
		var style;
		
		// recycle the name of the style attribute
		var name;
		
		// if it's a limited list, no need to run through the entire style object
		if (only && only instanceof Array) {
			
			for (var i = 0, l = only.length; i < l; i++) {
				// since we have the name already, just return via built-in .css method
				name = only[i];
				product[name] = this.css(name);
			}
			
		} else {
		
			// prevent from empty selector
			if (this.length) {
				
				// otherwise, we need to get everything
				var dom = this.get(0);
				
				// standards
				if (window.getComputedStyle) {
					
					// convenience methods to turn css case ('background-image') to camel ('backgroundImage')
					var pattern = /\-([a-z])/g;
					var uc = function (a, b) {
							return b.toUpperCase();
					};			
					var camelize = function(string){
						return string.replace(pattern, uc);
					};
					
					// make sure we're getting a good reference
					if (style = window.getComputedStyle(dom, null)) {
						var camel, value;
						// opera doesn't give back style.length - use truthy since a 0 length may as well be skipped anyways
						if (style.length) {
							for (var i = 0, l = style.length; i < l; i++) {
								name = style[i];
								camel = camelize(name);
								value = style.getPropertyValue(name);
								product[camel] = value;
							}
						} else {
							// opera
							for (name in style) {
								camel = camelize(name);
								value = style.getPropertyValue(name) || style[name];
								product[camel] = value;
							}
						}
					}
				}
				// IE - first try currentStyle, then normal style object - don't bother with runtimeStyle
				else if (style = dom.currentStyle) {
					for (name in style) {
						product[name] = style[name];
					}
				}
				else if (style = dom.style) {
					for (name in style) {
						if (typeof style[name] != 'function') {
							product[name] = style[name];
						}
					}
				}
			}
		}
		
		// remove any styles specified...
		// be careful on blacklist - sometimes vendor-specific values aren't obvious but will be visible...  e.g., excepting 'color' will still let '-webkit-text-fill-color' through, which will in fact color the text
		if (except && except instanceof Array) {
			for (var i = 0, l = except.length; i < l; i++) {
				name = except[i];
				delete product[name];
			}
		}
		
		// one way out so we can process blacklist in one spot
		return product;
	
	};
	
	// sugar - source is the selector, dom element or jQuery instance to copy from - only and except are optional
	$.fn.copyCSS = function(source, only, except) {
		var styles = $(source).getStyles(only, except);
		this.css(styles);
		
		return this;
    };
    //#endregion
    //#region to delete
    function getAllProperties(obj,ignorePrivate,ignoreRoot){
        var allProps = []
          , curr = obj
        do{
            if(ignoreRoot&&curr===Object.prototype){
                break;
            }
            var props = Object.getOwnPropertyNames(curr)
            props.forEach(function(prop){
                var ignore=false;
                if(ignorePrivate){
                    if(prop.indexOf("_")===0){
                        ignore=true;
                    }
                }
                if(!ignore){
                    if (allProps.indexOf(prop) === -1)
                    allProps.push(prop)
                }
                
            })
        }while(curr = Object.getPrototypeOf(curr))
        return allProps
    }
    function interceptor(toIntercept,intercepts,blacklist){
        var wrapper={};
        var props=getAllProperties(toIntercept,true,true);
        for(var i=0;i<props.length;i++){
            var prop=props[i];
            console.log(prop + " " + typeof(toIntercept[prop]));
        }
    }
    //#endregion
    $.widget( "tonyhallett.dialogNoTitle", $.ui.dialog, {
        _create: function() {
            this._super();
            if(this.options.noTitleBar){
                this.uiDialogTitlebar.css("display","none" );
            }else if(this.options.noCloseButton){
                this.uiDialogTitlebarClose.css("display","none");
            }
            
        }
    });
    var defaultElementClass='th_default_opener';
    $.widget("tonyhallett.cloneDialogOpener", {      
        options: {
            cloneOnCreate:false,
            alwaysClone:false,
            cloneCss:true,//will be false
            cloneCssRoot:false,

            draggableOptions:undefined,
            dialogOptions:{hide:500,show:500,noCloseButton:true,resizable:false,autoOpen:false},
            defaultAppendToSelector:"body"
        },
        _clone:null,
        
        
        defaultElement:$("<img style='position:fixed;bottom:0px;z-index:100;background-color: #ffffff;border: 1px solid #eeeeee;box-shadow: 1px 1px 5px rgba(0, 0, 0, .1);padding:10px'  class='" + defaultElementClass + "' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAB8ElEQVRoQ+2ZUU6DQBCGZ2wj+iD0CPUG9dHIHfQG1hOoJ9EbSG9Qb2BiGx/tEeoJ7OKDYoxjaCUhpHQ7DAuULK8ss/PN/8/ukkVo2YMt4wEL1HRFrUKtVOjz5aAf/Th3gDBAgH6ZkAQwB4KZ041uD0+/5tzYbMv9w7wiQo87GWc8ESycbnTChWIDqYk7BsBzTnLFx9Kj54cXnO/ZQItn7920OglAbL+er46NAqmJR+kJPF+xi7IpQWl8djLSCXXVlsa3QNIKWoWYPWotZy2na5rMe2nBrOWkFdQJJo1vFZJW0Cpk9yGdB0peVnXTSS1tFwVpBa1CdS8K4fRoSLT3oFMi709X6gAjPbQN1E4BxerooHYOKIZSU/ceCK/X2a+hQDTy/HC4LuEdVKg4TFyAhilUBIZGAHiZqNkgIDfg2gzx98o9+wjSNmwMUN7+ktczCUzyXTKu0UDbwqShYsXWFafyjTWbBBdGd4KoFahsmOXeJbwMYB99sr2QrXi2Z3SKZN/XAmRCmQSscqAiMLpTQ56KBPDW8xXrDpdluSphVpAGrySrhiEA5XSigbFLYzVxg/TRJa7fpgVAYjMEmu13vm+4MMucOKtQGkq6mnHm5YxlAa32CTdApKe8nZ4zuYmxbCATSZQZ0wKVWU0TsVqn0B8SptRED0pRGwAAAABJRU5ErkJggg==' width='52' height='52'/>"),
        _destroy:function(){
            if(this.dialog){
                this.dialog.destroy();
            }
            if(this.draggable){
                this.draggable.destroy();
            }
            if(this._elementIsDefault()){
                this.element.detach();
                window.setTimeout(function(){
                    this.element.remove();
                }.bind(this),0);
            }
        },
        _cloneCss:function(elementToClone){
            if(this.options.cloneCss){
                var originalElements=elementToClone.find('*').toArray();
                if(this.options.cloneCssRoot){
                    originalElements.push(elementToClone);
                }
                
                var clonedElements=this._clone.find('*').toArray();
                if(this.options.cloneCssRoot){
                    clonedElements.push(this._clone);
                }
                
                for(var i=0;i<originalElements.length;i++){
                    $(clonedElements[i]).copyCSS(originalElements[i],null,['width','height']);
                }
            }
        },
        _getDialogOptions:function(){
            var dialogOptions=$.extend({},this.options.dialogOptions,
                {
                    draggable:false,
                    position: { my: "left bottom", at: "left top", of: this.element},
                }
            );
            
            var noTitleBar=true;
            if(dialogOptions.noTitleBar!==undefined){
                noTitleBar=dialogOptions.noTitleBar;
            }else{
                if(dialogOptions.title||this._clone.attr("title")){
                    noTitleBar=false;
                }
            }
            dialogOptions.noTitleBar=noTitleBar;
            return dialogOptions;
        },
        clone:function(){
            if(this._clone){
                this._clone.dialogNoTitle("destroy");
            }
            var elementToClone=$(this.options.cloneSelector);
            this._clone=elementToClone.clone();
            this._cloneCss(elementToClone);
            
            
            
            this._on(this._clone,{
                "dialognotitleclose":function(){
                    this._showing=false;
                },
                "dialognotitleopen":function(){
                    this._showing=true;
                }
            });
            this._clone.dialogNoTitle(this._getDialogOptions());
            
            this.dialog=this._clone.dialogNoTitle('instance');
        },
        _getClone:function(){
            var shouldClone=this.options.alwaysClone?true:(this._clone?false:true);
            if(shouldClone){
                this.clone();
            }
            return this._clone;
        },
        _showDialog:function(){
            var clone=this._getClone();
            clone.dialogNoTitle("open");
        },
        _hideDialog:function(){
            this._clone.dialogNoTitle("close");
        },
        _showing:false,
        _allowClick:true,
        _elementIsDefault:function(){
            return this.element.hasClass(defaultElementClass);
        },
        _setUpClickHideShowDialog:function(){
            this._on({'click':function(){
                if(this._allowClick){
                    if(this._showing){
                        this._hideDialog();
                    }else{
                        this._showDialog();
                    }
                }
            }});
        },
        draggable:undefined,
        _alignDialog:function(){
            if(this.dialog && this.dialog.isOpen()){
                this.dialog.option('position',{ my: "left bottom", at: "left top", of: this.element});
            }
        },
        _setUpDraggable:function(){
            if(this.options.draggableOptions){
                var draggableOptions=this.options.draggableOptions;
                if(!draggableOptions.containment){
                    draggableOptions.containment="document";
                }
                
                this.element.draggable(
                    draggableOptions
                );
                if(!this.draggable){
                    this.draggable=this.element.draggable('instance');
                    //binding rather than setting through options otherwise have to wrap
                    this._on(
                        {
                            "dragstart": function(event,ui){
                                this._allowClick=false;
                            },
                            "drag":function(event,ui){
                                this._alignDialog();
                            },
                            "dragstop":function(event,ui){
                                this._alignDialog();
                                window.setTimeout(function(){
                                    this._allowClick=true;
                                }.bind(this),0);
                            }
                        }
                    );
                }
                
            }
        },
        _setUpDialog:function(){
            this._setUpClickHideShowDialog();
            if(this.options.cloneOnCreate){
                this.clone();
            }
        },
        _create: function(){
            this._addDefaultToDom();
            this._setUpDialog();
            this._setUpDraggable();
            
        },
        _addDefaultToDom:function(){
            if(this._elementIsDefault()){
                this.element.appendTo(this.options.defaultAppendToSelector);
            }
        },

        _setOptions:function(options){
            this._super(options);
            this._setUpDraggable();
            //what to di if dialog is showing ?

        }
        
    });

}( jQuery ));