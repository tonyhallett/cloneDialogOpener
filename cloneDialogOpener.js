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
    $.widget( "tonyhallett.dialogNoTitle", $.ui.dialog, 
        {
            _create: function() {
                this._super();
                this._changeTitleBar();
            },
            _setOptions:function(options){
                this._super(options);
                this._changeTitleBar();
            },
            _changeTitleBar:function(){
                //will have to have else statements
                if(this._getNoTitleBar()){
                    this.uiDialogTitlebar.css("display","none" );
                }else{
                    this.uiDialogTitlebar.removeAttr('style');
                }
                
                if(this.options.noCloseButton){
                    this.uiDialogTitlebarClose.css("display","none");
                }else{
                    this.uiDialogTitlebar.removeAttr('style');
                }
            },
            _getNoTitleBar:function(){
                var noTitleBar=true;
                if(this.options.noTitleBar!==undefined){
                    noTitleBar=this.options.noTitleBar;
                }else if(this.options.title||this.element.attr("title")){
                    noTitleBar=false;
                }
                return noTitleBar;
            }
        }
    );
    var defaultElementClass='th_default_opener';
    
    $.widget("tonyhallett.dialogOpener", { 
        //#region options     
        options: {
            sameDialog:false,
            draggableOptions:undefined,
            dialogOptions:{hide:500,show:500,noCloseButton:true,resizable:false,autoOpen:false},
            defaultAppendToSelector:"body"
        },
        _setOptions:function(options){
            var draggableOptionSet=false;
            var dialogOptionSet=false;
            $.each(options,function(propName,value){
                if(propName.indexOf("draggableOptions")!==-1){
                    draggableOptionSet=true;
                }else if(propName.indexOf("dialogOptions")!==-1){
                    dialogOptionSet=true;
                }
                if(draggableOptionSet&&dialogOptionSet){
                    return false;
                }
            });
            this._super(options);
            if(draggableOptionSet){
                this._setUpDraggable();
            }
            if(dialogOptionSet){
                if(this._dialog){
                    this._dialog.option(this._getDialogOptions());
                    this._alignDialog();
                }else{
                    this._createDialog();
                }
            }
        },
        //#endregion
        //#region default element
        defaultElement:$("<img style='position:fixed;bottom:0px;z-index:100;background-color: #ffffff;border: 1px solid #eeeeee;box-shadow: 1px 1px 5px rgba(0, 0, 0, .1);padding:10px'  class='" + defaultElementClass + "' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAB8ElEQVRoQ+2ZUU6DQBCGZ2wj+iD0CPUG9dHIHfQG1hOoJ9EbSG9Qb2BiGx/tEeoJ7OKDYoxjaCUhpHQ7DAuULK8ss/PN/8/ukkVo2YMt4wEL1HRFrUKtVOjz5aAf/Th3gDBAgH6ZkAQwB4KZ041uD0+/5tzYbMv9w7wiQo87GWc8ESycbnTChWIDqYk7BsBzTnLFx9Kj54cXnO/ZQItn7920OglAbL+er46NAqmJR+kJPF+xi7IpQWl8djLSCXXVlsa3QNIKWoWYPWotZy2na5rMe2nBrOWkFdQJJo1vFZJW0Cpk9yGdB0peVnXTSS1tFwVpBa1CdS8K4fRoSLT3oFMi709X6gAjPbQN1E4BxerooHYOKIZSU/ceCK/X2a+hQDTy/HC4LuEdVKg4TFyAhilUBIZGAHiZqNkgIDfg2gzx98o9+wjSNmwMUN7+ktczCUzyXTKu0UDbwqShYsXWFafyjTWbBBdGd4KoFahsmOXeJbwMYB99sr2QrXi2Z3SKZN/XAmRCmQSscqAiMLpTQ56KBPDW8xXrDpdluSphVpAGrySrhiEA5XSigbFLYzVxg/TRJa7fpgVAYjMEmu13vm+4MMucOKtQGkq6mnHm5YxlAa32CTdApKe8nZ4zuYmxbCATSZQZ0wKVWU0TsVqn0B8SptRED0pRGwAAAABJRU5ErkJggg==' width='52' height='52'/>"),
        _elementIsDefault:function(){
            return this.element.hasClass(defaultElementClass);
        },
        _addDefaultToDom:function(){
            if(this._elementIsDefault()){
                this.element.appendTo(this.options.defaultAppendToSelector);
            }
        },
        //#endregion
        
        
        //#region dialog
        //#region dialog methods
        dialogClose:function(){
            this._dialog.close();
        },
        dialogOpen:function(){
            this._dialog.open();
        },
        dialogIsOpen:function(){
            return this._dialog.isOpen();
        },
        //does this make sense ?
        dialogMoveToTop:function(){
            return this._dialog.moveToTop();
        },
        //#endregion
        _setUpDialog:function(){
            this._setUpClickHideShowDialog();
            if(this.options.dialogOptions.autoOpen){
                this._createDialog();
            }
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
        _showing:false,
        _dialog:undefined,
        _createDialog:function(){
            if(this._dialog){
                this._dialog.destroy();
            }
            var dialogElement=this._getDialogElement();
            
            this._on(dialogElement,{
                "dialognotitleclose":function(){
                    this._showing=false;
                },
                "dialognotitleopen":function(){
                    this._showing=true;
                }
            });
            dialogElement.dialogNoTitle(this._getDialogOptions(dialogElement));
            
            this._dialog=dialogElement.dialogNoTitle('instance');
        },
        _getDialogOptions:function(clone){
            var dialogOptions=$.extend({},this.options.dialogOptions,
                {
                    draggable:false,
                    position: { my: "left bottom", at: "left top", of: this.element},
                }
            );
            return dialogOptions;
        },
        
        _setDialog:function(){
            var shouldCreateDialog=this._dialog?!this.options.sameDialog:true;
            if(shouldCreateDialog){
                this._createDialog();
            }
        },
        _showDialog:function(){
            this._setDialog();
            this._dialog.open();
        },
        _hideDialog:function(){
            this._dialog.close();
        },
        _alignDialog:function(){
            if(this._dialog && this._dialog.isOpen()){
                this._dialog.option('position',{ my: "left bottom", at: "left top", of: this.element});
            }
        },
        //#endregion
        //#region draggable
        draggableDisable:function(){
            this._draggable.disable();
        },
        draggableEnable:function(){
            this._draggable.enable();
        },
        draggableIsDisabled:function(){
            return this._draggable.option("disabled");
        },
        _allowClick:true,
        _draggable:undefined,
        _setUpDraggable:function(){
            if(this.options.draggableOptions){
                var draggableOptions=this.options.draggableOptions;
                if(!draggableOptions.containment){
                    draggableOptions.containment="document";
                }
                
                this.element.draggable(
                    draggableOptions
                );
                if(!this._draggable){
                    this._draggable=this.element.draggable('instance');
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
        //#endregion
        _create: function(){
            this._addDefaultToDom();
            this._setUpDialog();
            this._setUpDraggable();
        },
        _destroy:function(){
            if(this._dialog){
                this._dialog.destroy();
            }
            if(this._draggable){
                this._draggable.destroy();
            }
            if(this._elementIsDefault()){
                this.element.detach();
                window.setTimeout(function(){
                    this.element.remove();
                }.bind(this),0);
            }
        },
    });
    $.widget( "tonyhallett.cloneDialogOpener", $.tonyhallett.dialogOpener,{
        _create:function(){
            this.options.sameDialog=!this.options.alwaysClone;
            this._super();
        },
        options:{
            alwaysClone:false
        },
        _getDialogElement:function(){
            return this._applyCloning();
        },
        //#region cloning
        _cloneCss:function(elementToClone,clone){
            var shouldClone=this.options.cloneCss===true||typeof this.options.cloneCss==='function';
            if(shouldClone){
                var originalElements=[elementToClone].concat(elementToClone.find('*').toArray());
                var clonedElements=[clone].concat(clone.find('*').toArray());
                
                for(var i=0;i<originalElements.length;i++){
                    var originalElement=originalElements[i];
                    var cloneCssCallback=typeof this.options.cloneCss==='function'?this.options.cloneCss:function(){return true;};
                    var cloneCssResult=cloneCssCallback(originalElement,i);
                    if(cloneCssResult!==false){
                        if(cloneCssResult===true){
                            $(clonedElements[i]).copyCSS(originalElement);
                        }else{
                            $(clonedElements[i]).copyCSS(originalElements[i],cloneCssResult.only,cloneCssResult.except);
                        }
                    }
                }
            }
        },
        _applyCloning:function(){
            var elementToClone=$(this.options.cloneSelector);
            var clone=elementToClone.clone();
            this._cloneCss(elementToClone,clone);
            return clone;
        },
        _setOption:function(key,value){
            if(key==="alwaysClone"){
                this._super("sameDialog",!value);
            }
            this._super(key,value);
            
        }
        //#endregion
    } );

}( jQuery ));