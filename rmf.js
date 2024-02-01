RMF_basicNameArr=[
   "nameStack","formCol"
];
function EXTRACT_basic(a,b){
   for(var mem in RMF_basicNameArr)
   {
      a[mem]=b[mem]
   }
}

function RMFconcatName(nameStack, name){
  
   if(name || name === 0){
      if(nameStack){
         return nameStack+"-"+name;
      }return name;
   }return "";
}
function RMFgetName(config){
   return RMFconcatName(config.nameStack, config.name);
}

function RMFidHelper(id, app){
   app= app || "";
   if(id){
      return id+app;
   }return "";
}
function RMFclassHelper(cls, runner, cust, app){
   app=app || "";
   cls=cls || "";
   runner= runner || "";
   var ret="";
   
   ret+=cls+" ";
   if(runner){
      ret+=runner+app+" ";
   }
   if(cust){
      ret+=cust+app;
   }
   return ret.trim();
}
function RMFid(config, id){
   return RMFidHelper(config.id, id);
}
function RMFclass(config, cls, app){
   return RMFclassHelper(cls, config.classRunner, config.class, app);
}
function RMFsequenceHelper(text,client,tf){
    if(tf){
       return [client,text];
    }return [text,client];
}
function RMFdefaults(conf, def, specials){
   if(typeof conf !== "object"){
      throw new TypeError("Conf has to be an object");
   }
   def=def || {}; specials=specials || {};
   for(var mem in def)
   {
       if(typeof conf[mem] === "undefined"){
          conf[mem]=def[mem];
       }
   }
   for(var mem in specials)
   {
      if(specials[mem] === "rawBool"){
         conf[mem] = !!conf[mem]; 
      }
   }
}

function RMF_extractForExtension(ret, ob){
   for(var mem in ob)
   {
       ret[mem]=ob[mem];
   }
    if(ob.COLL){ob.EXT_OLDCOLL=ob.COLL;}
}
/*
  all configs get::: 
    nameStack - running name stack for nested inputs
    forColl   - the object to be recieving the form collection object
  from the MAKE function
*/
function RMFbasicRawInput(rmfdefault, rmfspecials, coll, set, bodyFunction){
   
    rmfdefault=rmfdefault || {};
    rmfspecials=rmfspecials || {};
    coll = coll;
    set = set || function(v){this.inp.value=v;}
    bodyFunction= bodyFunction || function(config,ret){
      ret.inp=ret.el=_el.TEXT("No body function provided.");
    }
    
    RMFdefaults(rmfdefault, {
        name:"",
        id:"",
        class:"",
        default:""
    });

    return function(config){
       config=config || {};
      // console.log(rmfdefault);
       RMFdefaults(config,rmfdefault, rmfspecials);
       //console.log(config);
       var ret={
           COLL:coll,
           SET:set
       };
       bodyFunction.call(this,config, ret);
       
       ret.SET("");
       return ret;
    } 
}
function RMFbasicInput(rmfdefault, rmfspecials, coll, set, bodyFunction, labelType){
    rmfdefault=rmfdefault || {};
    rmfspecials=rmfspecials || {};
    coll = coll;
    set = set || function(v){this.inp.value=v;}
    bodyFunction= bodyFunction || function(config,ret){
      ret.inp=ret.el=_el.TEXT("No body function provided.");
    }
    
    RMFdefaults(rmfdefault, {
        name:"",
        id:"",
        class:"",
        default:"",
        classRunner:""
    });
    return function(config){
       config=config || {};
      // console.log(rmfdefault);
       RMFdefaults(config,rmfdefault, rmfspecials);
       //console.log(config);
       var ret={
           COLL:coll,
           SET:set
       };
       bodyFunction.call(this,config, ret);
       this.basicLabelError({
          inp:ret.inp,
          otherRet:ret,
          labelText:config.labelText,
          labelSequence:config.labelSequence,
          labelType:labelType,
          errorText:config.errorText,
          errorSequence:config.errorSequence,
          data:config.data,
          dataType:config.dataType,
          classRunner:config.classRunner,
          class:config.class
       });
       ret.SET(config.default);
       return ret;
    }
}

/*
  all configs get::: 
    nameStack - running name stack for nested inputs
    forColl   - the object to be recieving the form collection object
  from the MAKE function
*/

function RMFbasicMultiInput(rmfdefault, rmfspecials, coll, inpList, insOb){
    rmfdefault=rmfdefault || {};
    rmfspecials=rmfspecials || {};
    coll = coll || function(a){return a;}
    
    insOb=insOb || {};
    
    RMFdefaults(rmfdefault, {
        name:"",
        id:"",
        class:"",
        default:"",
        preInps:{}
    });

    //alert("hey");
    return RMFbasicInput(rmfdefault, rmfspecials, function(){
       return coll(this.newCol.COLL());
    },
    function(v){
     //  console.log(this.newCol);
       this.newCol.SET(v);
    },//SET
    function(config, ret){
        ret.inp=_el.CREATE("div","","",{});
        
        for(var mem in insOb)
        {
          ret.inp[mem]=(function(m){
             return function(){
                 insOb[m].CALL(ret);
             }
          })(mem)
        }

        for(var i=0; i< inpList.lengh; i++)
        {
           inpsList[i]=_ob.COMBINE(inpList[i], config.preInps[inpList[i].name] || {});
        }

        var newColOb={};
        ret.newCol=newCol=new FORM_COL_OB(newColOb);
        MAKE(ret.inp, inpList, newColOb, RMFconcatName(config.nameStack, config.name), config.inpsConfig);
    },"section");
}

/*
  all configs get::: 
    nameStack - running name stack for nested inputs
    formColl   - the object to be recieving the form collection object
  from the MAKE function
*/



var INPTYPES={
   CURRY:function(name){
      var t=this;
      return function(config){
         return t[name](config);
      }
   },
   "span":function(config){
      RMFdefaults(config, {
        name:"", id:"", class:"", default:"", classRunner:""
      });
      var ret= {
        el:_el.CREATE('span', RMFid(config, "span"), RMFclass(config, "RMFspans"))
      };
      if(config.text){
         _el.APPEND(ret.el, _el.TEXT(config.text));
      }else if(config.element){
         _el.APPEND(ret.el, config.element);
      }
      return ret;
   },
   "basicLabelError":function(config){
       /*config is an object
          inp:the input to put in label and error,
          errorText: text for the error,
          errorSequence: true for the error after the input false for before,
          labelText: text for the label,
          labelSequence: true for the label after the input false for before,
          labelType: ENUM("label","section"),
          otherRet: a ret to recieve the members
          
       */
       config=config || {};
       //console.log(config.otherRet);
       RMFdefaults(config, {
         inp:_el.TEXT("ERROR: There was no inp provided"),
         errorText:"",
         labelText:"",
         errorSequence:true,
         labelSequence:false,
         labelType:"label",
         otherRet:{}
       },{
         labelSequence:"rawBool",
         errorSequence:"rawBool" 
       });
       
       var ret={};
       var errorBox=this.error({
         erroree:config.inp,
         text:config.errorText,
         sequence:config.errorSequence,
         classRunner:config.classRunner,
         class:config.class
      });
      ret.errorBox=errorBox.el;
      ret.errorTextBox=errorBox.textBox;
      
      var labelBox;
      if(config.labelType === "label"){
         labelBox=this.label({
            labelee:ret.errorBox,
            text:config.labelText,
            sequence:config.labelSequence,
            data:config.data,
            dataType:config.dataType,
            classRunner:config.classRunner,
            class:config.class
         });
      }else{
         labelBox=this.sectionLabel({
            labelee:ret.errorBox,
            text:config.labelText,
            sequence:config.labelSequence,
            data:config.data,
            dataType:config.dataType,
            classRunner:config.classRunner,
            class:config.class
         });
      }
      ret.el=ret.label=labelBox.el;
      ret.labelTextBox=labelBox.textBox;
       
       for(var mem in ret)
       {config.otherRet[mem]=ret[mem];}
       return ret;
   },
   "label":function(config){
      /*config is an object
         text: text for the label,
         labelee: element to be labeled,
         sequence: false for text before labelee true for after,
         id: an id to pass around,
         class: a class to pass around,
         name: a name to pass around
      */
      config=config || {};
      RMFdefaults(config, {
        text:"",
        labelee:_el.TEXT("No labelee given"),
        id:"",class:"",name:"",classRunner:""
      },{
        sequence:"rawBool"
      });

      var ret={};
      
      ret.el=_el.CREATE('label',RMFid(config, "label"),RMFclass(config, "RMFlabels","label"),{},RMFsequenceHelper(
         ret.textBox=_el.CREATE('span',RMFid(config, "textBox"),RMFclass(config, "RMFtextBoxes","textBox"),{},[RMFgetCard(config, 1)]),
         config.labelee,
         config.sequence
      ));

      


      return ret;
   },
   "sectionLabel":function(config){
       /*config is an object
          text: text for the label,
         labelee: element to be labeled,
         sequence: false for text before labelee true for after,
         id: an id to pass around,
         class: a class to pass around,
         name: a name to pass around
       */
      config=config || {};
      RMFdefaults(config, {
        text:"",
        labelee:_el.TEXT("No labelee given"),
        id:"",class:"",name:"",classRunner:""
      },{
        sequence:"rawBool"
      });

      var ret={};
      
      ret.el=_el.CREATE('div',RMFid(config, "sectionLabel"),RMFclass(config,"RMFsectionLabels", "sectionLabel"),{},RMFsequenceHelper(
         ret.textBox=_el.CREATE('div',RMFid(config, "textBox"),RMFclass(config,"RMFtextBoxes", "textBox"),{},[RMFgetCard(config, 0)]),
         config.labelee,
         config.sequence
      ));

      return ret;
   },
   "error":function(config){
      /*config is an object
         text: text for the label,
         erroree: element to be labeled for errors,
         sequence: false for text before labelee true for after,
         id: an id to pass around,
         class: a class to pass around,
         name: a name to pass around
      */
      config=config || {};
      RMFdefaults(config,{
          text:"",
          erroree:_el.TEXT("No erroree given"),
          id:"",class:"",name:"", classRunner:""
      },{
          sequence:"rawBool"
      });

      var ret={};
      
      ret.el=_el.CREATE('span',RMFid(config, "errorBox"),RMFclass(config, "RMFerrorBoxes","errorBox"),{},RMFsequenceHelper(
         ret.textBox=_el.CREATE('div',RMFid(config, "errorBoxTextBox"),RMFclass(config, "RMFtextBoxes","textBox"),{},[_el.TEXT(config.text)]),
         config.erroree,
         config.sequence
      ));

      return ret;
   },
   "header":function(config){
      /*config==>
         {
             level: the level of the header,
             text: the text in the header,
             id: an id for the header,
             class: a class to give to the header,
             name:a name for the id
         }
      */     
      config=config || {};
      config.nameStack=config.nameStack || "";
      config.name=config.name || "";
      config.wholeName=RMFconcatName(config.nameStack, config.name);
      config.level=config.level || 1;
      config.text=config.text || "";

      config.id=config.id || "";

      config.class= config.class || "";


      var ret={};
      ret.el=_el.CREATE('h'+config.level, RMFid(config, ""), RMFclass(config, "RMFheader","header"), {},[_el.TEXT(config.text)]);
      return ret;
   },
   "section":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFsection",
        inps:[]// inps: a list of inputs
      },/// rmfdefault
      {},// rmfspecials
      false,// COLL
      false,//SET
      function(config,ret){
        // console.log(config);
         ret.inp=_el.CREATE("div", RMFid(config), RMFclass(config, "RMFsection"), {}); 
         MAKE(ret.inp, config.inps, config.formCol, config.nameStack, config.inpsConfig);
      },
      "section"//labelType
   ),
   "compound":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFcompound",
        inps:[]// inps: a list of inputs
      },/// rmfdefault
      {},// rmfspecials
      function(){
         return this.FCOLL.COLL();
      },// COLL
      function(a){
         this.FCOLL.SET(a);
      },//SET
      function(config,ret){
        // console.log(config);
         ret.inp=_el.CREATE("div", RMFid(config), RMFclass(config, "RMFcompound"), {}); 
         var fc={};
         ret.FCOLL=new FORM_COL_OB(fc);
        // console.log('from compound', config);
         MAKE(ret.inp, config.inps, fc, RMFconcatName(config.nameStack, config.name), config.inpsConfig);
      },
      "section"//labelType
   ),
   "dynamicList":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFdynamicList",
        inpType:"singleLine", // listType is a string that is the name of the member of INPTYPES
        addText:"+Add", // the text to be in the add input button
        removeText:"X", // the text to be in the remove input button
        inpConfig:{}, // inpConfig: object to be passed to the listType function
        inpText:"",// inpText: text for each of the child input labels 
        beforeOrAfter:false
        // removeListener
        // inpTypeFunct // a function that returns the equivilant of what an inp type would
      },/// rmfdefault
      {},// rmfspecials
      function(){
         var ret=[];
         for(var mem in this.inps)
         {
            ret.push(this.inps[mem].COLL());
         }
         return ret;
      },// COLL
      function(v){
         v=v || [];
         var temp;
  		 this.CLEAR_inps();
         for(var i=0; i<v.length; i++)
         {
            temp=this.ADD_inp();
            temp.SET(v[i]);
         }
      },//SET
      (function(){ 
        function ADD_inp(v){
            var tempInp;// todo 
            if(this.config.inpTypeFunct){
               tempInp=this.config.inpTypeFunct({
                  name:RMFgetName({nameStack:this.config.nameStack, name:RMFconcatName(this.config.name, this.inpInd)}),
                  labelText:this.config.inpText
               });
            }else{
               tempInp=INPTYPES[this.config.inpType](_ob.COMBINE(this.config.inpConfig,{
                  name:RMFgetName({nameStack:this.config.nameStack, name:RMFconcatName(this.config.name, this.inpInd)}),
                  labelText:this.config.inpText
               }));
            }
            var remButton;
            var el=_el.CREATE('div',"",RMFclass(this.config, "RMFdynamicListMems", "dynamicListMem"),{
				attributes:{DATA_inpInd:this.inpInd}
			},[
              remButton=_el.CREATE('input',"",RMFclass(this.config,"RMFdynamicListMemRemoveButtons","dynamicListMemRemoveButton"),{
                 type:"button",
                 value:this.config.removeText,
                 onclick:REMOVE_inp,
                 DATA_ret:this,
                 DATA_inpInd:this.inpInd
               },[]),
               (tempInp).el
           ])
           tempInp.removeButton=remButton;
           this.inps[this.inpInd]=tempInp;
           this.inpInd++;
           if(this.config.beforeOrAfter){
              this.listCatcher.insertBefore(el, this.listCatcher.children[0]);
           }else{
              _el.APPEND(this.listCatcher, el);
           }
           if(this.config.addListener){
              this.config.addListener(tempInp);
           }
           if(v){
			   tempInp.SET(v);
		   }
           return tempInp;
        }
		
		function CLEAR_inps(){
			for(var mem in this.inps)
			{
				this.inps[mem].removeButton.dispatchEvent(new Event('click'));
			}
		}
        function REMOVE_inp(){
           _el.REMOVE(this.parentNode);
           if(this.DATA_ret.config.removeListener){
              this.DATA_ret.config.removeListener(this.DATA_ret.inps[this.DATA_inpInd]);
           }
           delete this.DATA_ret.inps[this.DATA_inpInd];
        }
        var inpFunct;
        return function(config,ret){
           // console.log(config);
           ret.inpFunct=this[config.inpType];
           ret.inpInd=0;
           ret.inps={};
           ret.config=config;
           ret.ADD_inp=ADD_inp;
		   ret.CLEAR_inps=CLEAR_inps;
           ret.inpType=config.inpType;
           ret.inp=_el.CREATE("div", RMFid(config), RMFclass(config, "RMFdynamicList","dynamicList"), {},[]); 
           ret.EMPTY=function(){
              for(var mem in this.inps)
              {
                 this.inps[mem].removeButton.onclick.call(this.inps[mem].removeButton);
              }
           }
           if(!config.beforeOrAfter){
              _el.APPEND(ret.inp, ret.listCatcher=_el.CREATE('div',RMFid(config, "listCatcher"), RMFclass(config,"RMFdynamicListCatcher","dynamicListCatcher")));
           }
           _el.APPEND(ret.inp,_el.CREATE('input',RMFid(config,"addButton"),RMFclass(config, "RMFdynamicListAddButton","dynamicListAddButton"),{
                 type:"button",
                 value:config.addText,
                 onclick:function(){
                    ret.ADD_inp();
                 }
              }));
           if(config.beforeOrAfter){
              _el.APPEND(ret.inp, ret.listCatcher=_el.CREATE('div', RMFid(config, "listCatcher"), RMFclass(config,"RMFdynamicListCatcher","dynamicListCatcher")));
           }
         }
      })(),
      "section"//labelType
   ),
   "dynamicListOrdered":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFdynamicList",
        inpType:"singleLine", // listType is a string that is the name of the member of INPTYPES
        addText:"+Add", // the text to be in the add input button
        removeText:"X", // the text to be in the remove input button
        inpConfig:{}, // inpConfig: object to be passed to the listType function
        inpText:"",// inpText: text for each of the child input labels 
        beforeOrAfter:false
        // removeListener
        // inpTypeFunct // a function that returns the equivilant of what an inp type would
      },/// rmfdefault
      {},// rmfspecials
      function(){
         return Array.from(this.listCatcher.children).map(function(c){return c.FUN_coll();});
      },// COLL
      function(v){
         v=v || [];
         var temp;
  		 this.CLEAR_inps();
         for(var i=0; i<v.length; i++)
         {
            temp=this.ADD_inp();
            temp.SET(v[i]);
         }
      },//SET
      (function(){ 
        function ADD_inp(v){
            var tempInp;// todo 
            if(this.config.inpTypeFunct){
               tempInp=this.config.inpTypeFunct({
                  name:RMFgetName({nameStack:this.config.nameStack, name:RMFconcatName(this.config.name, this.inpInd)}),
                  labelText:this.config.inpText
               });
            }else{
               tempInp=INPTYPES[this.config.inpType](_ob.COMBINE(this.config.inpConfig,{
                  name:RMFgetName({nameStack:this.config.nameStack, name:RMFconcatName(this.config.name, this.inpInd)}),
                  labelText:this.config.inpText
               }));
            }
            var remButton;
            var el=_el.CREATE('div',"",RMFclass(this.config, "RMFdynamicListMems", "dynamicListMem"),{
				attributes:{DATA_inpInd:this.inpInd},
				FUN_coll:function(){
					return tempInp.COLL()
				}
			},[
				_el.CREATE('input','','',{type:'button',value:'T',onclick:function(){
					var par=this.parentNode;
					var parpar=par.parentNode;
					var ps=par.previousSibling;
					if(ps){
						_el.REMOVE(par);
						parpar.insertBefore(par, ps);
					}
				}}),
				_el.CREATE('input','','',{type:'button',value:'V', onclick:function(){
					var par=this.parentNode;
					var parpar=par.parentNode;
					var ns=(par.nextSibling || {}).nextSibling;
					_el.REMOVE(par);
					parpar.insertBefore(par, ns);

				}}),
              remButton=_el.CREATE('input',"",RMFclass(this.config,"RMFdynamicListMemRemoveButtons","dynamicListMemRemoveButton"),{
                 type:"button",
                 value:this.config.removeText,
                 onclick:REMOVE_inp,
                 DATA_ret:this,
                 DATA_inpInd:this.inpInd
               },[]),
               (tempInp).el
           ])
           tempInp.removeButton=remButton;
           this.inps[this.inpInd]=tempInp;
           this.inpInd++;
           if(this.config.beforeOrAfter){
              this.listCatcher.insertBefore(el, this.listCatcher.children[0]);
           }else{
              _el.APPEND(this.listCatcher, el);
           }
           if(this.config.addListener){
              this.config.addListener(tempInp);
           }
           if(v){
			   tempInp.SET(v);
		   }
           return tempInp;
        }
		
		function CLEAR_inps(){
			for(var mem in this.inps)
			{
				this.inps[mem].removeButton.dispatchEvent(new Event('click'));
			}
		}
        function REMOVE_inp(){
           _el.REMOVE(this.parentNode);
           if(this.DATA_ret.config.removeListener){
              this.DATA_ret.config.removeListener(this.DATA_ret.inps[this.DATA_inpInd]);
           }
           delete this.DATA_ret.inps[this.DATA_inpInd];
        }
        var inpFunct;
        return function(config,ret){
           // console.log(config);
           ret.inpFunct=this[config.inpType];
           ret.inpInd=0;
           ret.inps={};
           ret.config=config;
           ret.ADD_inp=ADD_inp;
		   ret.CLEAR_inps=CLEAR_inps;
           ret.inpType=config.inpType;
           ret.inp=_el.CREATE("div", RMFid(config), RMFclass(config, "RMFdynamicList","dynamicList"), {},[]); 
           ret.EMPTY=function(){
              for(var mem in this.inps)
              {
                 this.inps[mem].removeButton.onclick.call(this.inps[mem].removeButton);
              }
           }
           if(!config.beforeOrAfter){
              _el.APPEND(ret.inp, ret.listCatcher=_el.CREATE('div',RMFid(config, "listCatcher"), RMFclass(config,"RMFdynamicListCatcher","dynamicListCatcher")));
           }
           _el.APPEND(ret.inp,_el.CREATE('input',RMFid(config,"addButton"),RMFclass(config, "RMFdynamicListAddButton","dynamicListAddButton"),{
                 type:"button",
                 value:config.addText,
                 onclick:function(){
                    ret.ADD_inp();
                 }
              }));
           if(config.beforeOrAfter){
              _el.APPEND(ret.inp, ret.listCatcher=_el.CREATE('div', RMFid(config, "listCatcher"), RMFclass(config,"RMFdynamicListCatcher","dynamicListCatcher")));
           }
         }
      })(),
      "section"//labelType
   ),
   "singleLine":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFsingleLine",
        placeHolder:""
      },/// rmfdefault
      {},// rmfspecials
      function(){return this.inp.value;},// COLL
      function(v){this.inp.value=v;},//SET
      function(config,ret){
        // console.log(config);
         ret.inp=_el.CREATE("input", RMFid(config, "singleLine"), RMFclass(config,"RMFsingleLine","singleLine"), {
           name:RMFgetName(config), 
           placeholder: config.placeHolder,
           value:config.default
         }); 
      },
      "label"//labelType
   ),
   "checkbox":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFcheckbox",
        default:false
      },/// rmfdefault
      {default:"rawBool"},// rmfspecials
      function(){return this.inp.checked;},// COLL
      function(v){this.inp.checked=!!v;},//SET
      function(config,ret){
         var val = RMFgetValue(config);
        // alert(JSON.stringify(config));
         ret.inp=_el.CREATE('input',RMFid(config, "checkbox"), RMFclass(config,"RMFcheckbox","checkbox"),{
          type:"checkbox",
          checked:config.default,
          name:RMFgetName(config)
         });
         // alert(JSON.stringify(val));
         if(val !== ""){
            ret.inp.value=val;
            ret.inp.obVal=val;
         }
      //    alert(RMFgetName(config)+" "+JSON.stringify(config));
      },
      "label"//labelType
   ),
   "checkFamily":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for radio Input
            id: id for radio input ("")
            class:class for radio ("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFcheckFamily",
        inps:[] // a list of inps objects for the checkboxes in the family minus the name attribute with an extra 'value' member
       
      },/// rmfdefault
      {},// rmfspecials
      function(){
        var ret=[];
        for(var i=0; i<this.inps.length; i++)
        {
           if(this.inps[i].inp.checked === true){
              ret.push(this.inps[i].inp.obVal);
              //console.log(this.inps[i].inp.value);
           }
        }
        return ret;
      },// COLL
      function(v){
        v=v || [];
        var inf={};
        for(var i=0; i<v.length && v!=="all"; i++)
        {
           inf[v[i]]=true;
        }
        for(var i=0; i<this.inps.length; i++)
        {
           if( v === "all" || inf[this.inps[i].inp.value]){
              this.inps[i].inp.checked=true;
              continue;
           }this.inps[i].inp.checked=false;
        }
      },//SET
      function(config,ret){
         ret.inp=_el.CREATE('div',RMFid(config, "checkFamily"), RMFclass(config,"RMFcheckFamily","checkFamily"),{});
         ret.inps=[];
         for(var i=0; i<config.inps.length; i++)
         {
            var temp=this.checkbox(_ob.COMBINE(config.inps[i], {classRunner:config.classRunner,nameStack:config.nameStack, name:RMFconcatName(config.name, config.inps[i].value)}));
            _el.APPEND(ret.inp, temp.el);
            ret.inps.push(temp);
         }
      },
      "section"//labelType
   ),
   "radio":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for radio Input
            id: id for radio input ("")
            class:class for radio ("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFradio",
        default:false,
        onchange:""
      },/// rmfdefault
      {default:"rawBool"},// rmfspecials
      function(){if(this.inp.checked){return this.inp.value;}return undefined;},// COLL
      function(v){
        if(v === this.inp.value){this.inp.checked=true; return;}this.inp.checked=false;
      },//SET
      function(config,ret){
         ret.inp=_el.CREATE('input',RMFid(config, "radio"), RMFclass(config,"RMFradio","radio"),{
           type:"radio",
           checked:config.default,
           name:RMFgetName(config),
           onchange:config.onchange,
           value:RMFgetValue(config)
         });
      },
      "label"//labelType
   ),
   "radioFamily":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
          classRunner:"RMFradioFamily",
          inps:[],//  inps:a list of inp configs for the 'radio' inp type minus 'name' 'id' and 'class',
           onchange:""
      },/// rmfdefault
      {},// rmfspecials
      function(){
             var hol;
             for(var i=0; i<this.inps.length; i++)
             {
               if(typeof (hol=this.inps[i].COLL()) !== "undefined"){
                  return hol;
               }
             }return "";
      },// COLL
      function(v){
         for(var i=0; i<this.inps.length; i++)
         {
            this.inps[i].SET(v);
         }
      },//SET
      function(config,ret){
          ret.inps=[];
          ret.inp=_el.CREATE('div',RMFid(config, "radioFamily"), RMFclass(config,"RMFradioFamily","radioFamily"),{});
          for(var i=0; i<config.inps.length; i++)
          {
            var temp;
             ret.inps.push(temp=this.radio(_ob.COMBINE(config.inps[i],{
                name:config.name,
                onchange:config.onchange,
                nameStack:config.nameStack,
                classRunner:config.classRunner
             })));     
             if(config.default === temp.value){
                temp.checked=true;
             }
             _el.APPEND(ret.inp, temp.el);
          }
      },
      "section"//labelType
   ),
   "select":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFselect",
        inps:[], // opts: an array of objcts for creating options {value: "", labelText:""}
      },/// rmfdefault
      {},// rmfspecials
      function(){
        if(this.inp.options.length && this.inp.options[this.inp.selectedIndex]){
           return this.inp.options[this.inp.selectedIndex].value;
        }return null;
      },// COLL
      function(v){
        for(var i=0; i<this.inp.options.length; i++)
        {
          if(this.inp.options[i].value === v){
             this.inp.selectedIndex=i;
				 this.inp.dispatchEvent(new Event('change'));
			 break;
          }
        }
      },//SET
      function(config,ret){
         
         var optsList=[];
         var selectedIndex=0;
		 var opt;
		 ret.CHANGE_options=function(arr){
			 Array.from(ret.inp.children).forEach(function(a){
					 _el.REMOVE(a);
			 });
			 arr.forEach(function(a){
				 _el.APPEND(ret.inp, _el.CREATE('option','','',{value:a.value},[a.labelText]));
			 });
		 }
         for(var i=0; i<config.inps.length; i++)
         {
            if((!i && !config.default)){
                config.default=config.inps[i].value;
            }
            optsList.push(opt=_el.CREATE('option',RMFid(config, "option"), RMFclass(config,"RMFoption","option"),{value:RMFgetValue(config.inps[i])},[RMFgetCard(config.inps[i],0)]));
			if(config.inps[i].class){opt.className+=' '+config.inps[i].class;}
            if(config.inps[i].value === config.default){
               selectedIndex=i;
            }
         }
         ret.inp=_el.CREATE("select",RMFid(config, "select"), RMFclass(config,"RMFselect","select"),
		 _ob.COMBINE({
           name:RMFgetName(config),
           selectedIndex:selectedIndex
         },config.selectInsert || {}),
		 optsList);
		 ret.inp.selectedIndex=selectedIndex;
      },
      "label"//labelType
   ),
   "distinct":function(config){
      config=config || {};
      RMFdefaults(config, {
        distinctMode:"radio"
      });
      switch(config.distinctMode){
         case "radio":
           return this.radioFamily(config);
           break;
         case "select":
           return this.select(config);
           break;
      }
   },
   "selectToNew":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFselectToNew",
        selectConfig:{},// selectConfig: an object to be passed
        dynamicConfig:{},// a config to be passed to the single line inp
      },/// rmfdefault
      {},// rmfspecials
      function(){
        var selVal=this.selectInp.COLL();
        if(selVal === "--NEW--"){
           return this.dynamicInp.COLL();
        } 
        return selVal;
      },// COLL
      function(v){
         for(var i=0; i<this.selectInp.inp.options.length; i++)
         {
           // alert("yo");
           // alert(v+" - "+this.selectInp.inp.options[i].value);
            if(this.selectInp.inp.options[i].value == v){
                this.selectInp.SET(v);
               // alert("hey");
                return;
            }
         }
         this.selectInp.inp.selectedIndex=0;
         this.selectInp.inp.onchange.call(this.selectInp.inp);
         this.dynamicInp.SET(v); 
         
      },//SET
      function(config,ret){
         if(config.inps[0].value !== "--NEW--"){
            if(!("default" in config.selectConfig)){
               config.selectConfig.default=config.inps[0].value;
                //alert(config.selectConfig.inps[0].value);
            }
            config.inps.unshift({
              value:"--NEW--",
              labelText:"New"
            });
         }
         
		 ret.CHANGE_options=function(arr){
			 Array.from(ret.selectInp.inp.children).forEach(function(a){
				 if(a.value && a.value !== '--NEW--'){
					 _el.REMOVE(a);
				 }
			 });
			 arr.forEach(function(a){
				 _el.APPEND(ret.selectInp.inp, _el.CREATE('option','','',{value:a.value},[a.labelText]));
			 });
		 }
         ret.inp=_el.CREATE("div", RMFid(config, "selectToNew"), RMFclass(config,"RMFselectToNew","selectToNew"), {}); 
         config.dynamicConfig.name=config.name+"-NEW";
         config.dynamicConfig.nameStack=config.nameStack;
         ret.dynamicInpFunct=this.CURRY(config.dynamicConfig.type || "singleLine");
         var temp;
         _el.APPEND(ret.inp,[
            (temp=this.select(_ob.COMBINE(config.selectConfig,{
             name:config.name, inps:config.inps, nameStack:config.nameStack, classRunner:config.classRunner
            }))).el,
            ret.dynCatcher=_el.CREATE('div',RMFid(config, "selectToNewCatcher"), RMFclass(config,"RMFselectToNewCatcher","selectToNewCatcher"))
         ]);
         ret.selectInp=temp;
         temp.inp.onchange=function(){
           _el.EMPTY(ret.dynCatcher);
           if(this.options[this.selectedIndex].value === "--NEW--"){
              var temp=ret.dynamicInpFunct(config.dynamicConfig);
              _el.APPEND(ret.dynCatcher, temp.el);
              ret.dynamicInp=temp;
           }
         }
      },
      "label"//labelType
   ),
   "radioToNew":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFradioToNew",
        radioFamilyConfig:{},
        dynamicConfig:{}
        
      },/// rmfdefault
      {},// rmfspecials
      function(){
        var ret=this.radioInp.COLL();
        if(ret === "--NEW--"){
           ret=this.dynamicInp.COLL();
        }return ret;
      },// COLL
      function(v){
        for(var i=0; i<this.radioInp.inps.length; i++)
        {
           if(this.radioInp.inps[i].inp.value === v){
              this.radioInp.inps[i].inp.checked=true;
              return;
           }
        }
        this.radioInp.inps[i-1].inp.checked=true;
        this.radioInp.inps[i-1].inp.onchange.call(this.radioInp.inps[i-1].inp);
        this.dynamicInp.SET(v);
      },//SET
      function(config,ret){
         if(config.inps[config.inps.length-1].value !== "--NEW--"){
            if(!("default" in config.radioFamilyConfig)){
               config.radioFamilyConfig.default=config.inps[0].value;
                //alert(config.selectConfig.inps[0].value);
            }
            config.inps.push({
              value:"--NEW--",
              labelText:"New"
            });
         }
         ret.inp=_el.CREATE("div", RMFid(config, "radioToNew"), RMFclass(config,"RMFradioToNew","radioToNew"), {}); 
        
         var temp;
         _el.APPEND(ret.inp,[
            (temp=this.radioFamily(_ob.COMBINE(config.radioFamilyConfig, {nameStack:config.nameStack,name:config.name, inps:config.inps,
               onchange:function(){
                //alert("hey");
               _el.EMPTY(ret.dynCatcher);
                //console.log(this);
               if(this.value === "--NEW--"){
                 // alert("yo");
                  console.log(ret.dynCatcher);
                  var temp=ret.dynamicInpFunct(config.dynamicConfig);
                  //console.log(temp)
                  _el.APPEND(ret.dynCatcher, temp.el);
                  ret.dynamicInp=temp;
                  //ret.dynCatcher.style.border="3px solid red";
                  //console.log(ret.dynCatcher.children);
               }
             }
            }))).el,
            ret.dynCatcher=_el.CREATE('div',RMFid(config, "radioToNewCatcher"), RMFclass(config,"RMFradioToNewCatcher","radioToNewCatcher"))
         ]);
         ret.radioInp=temp;
         config.dynamicConfig.name=config.name+"-NEW";
         config.dynamicConfig.nameStack=config.nameStack;
         ret.dynamicInpFunct=this.CURRY(config.dynamicConfig.type || 'singleLine');
         
         
      },
      "section"//labelType
   ),
   "paragraph":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFparagraph",
        placeHolder:"", // placeHolder: a text to hold the place in the input
      },/// rmfdefault
      {},// rmfspecials
      function(){return this.inp.value;},// COLL
      function(v){this.inp.value=v;},//SET
      function(config,ret){
         var attributes={};
		 if(typeof config.spellCheck !== "undefined"){
			 if(!config.spellCheck){
				 attributes.spellcheck="false";
			 }
		 }
		 if(typeof config.wordWrap !== "undefined"){
			 if(!config.wordWrap){
				 attributes.wrap="off";
			 }
		 }
         ret.inp=_el.CREATE("textarea", RMFid(config, "paragraph"), RMFclass(config,"RMFparagraph","paragraph"), {
           name:RMFgetName(config), 
           placeholder: config.placeHolder,
           value:config.default,
		   attributes:attributes
		   
         }); 
      },
      "section"//labelType
   ),
   "shark":RMFbasicMultiInput({
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
            preInps: any arguments you want to send in the config of the inps by name ({})
        */
    },//rmfdefault 
    {},//rmfspecials 
    function(a){//coll
      return a;
    }, [//inpList
      {
        type:"singleLine",
        name:"name",
        labelText:"Name"
      },
      {
        type:"select",
        labelText:"Species",
        name:"species",
        inps:[
           {
              value:"greatWhite",
              labelText:"Great White"
           },
           {
              value:"hammer",
              labelText:"Hammer Head"
           }
        ]
      }
    ]),
    "dynamicOnRadio":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFdynamicOnRadio",
        dynamicForms:{}, // placeHolder: a text to hold the place in the input
        radioFamilyConfig:{}, 
        
      },/// rmfdefault
      {},// rmfspecials
      function(){
         var nam=this.radioFamilyInp.COLL();
         var ret={};
         ret[nam]=this.dynamicFormColl.COLL();
         return ret;
      },// COLL
      function(v){
         v=v || {};
         for(var mem in v)
         {
            this.radioFamilyInp.SET(mem);
            this.RADCHANGE();
            this.dynamicFormColl.SET(v[mem]);
         }
      },//SET
      function(config,ret){
         config.radioFamilyConfig.inps=[];
         config.radioFamilyConfig.name=config.name
         config.radioFamilyConfig.nameStack=config.nameStack;
         for(var mem in config.dynamicForms)
         {
            config.radioFamilyConfig.inps.push({
              labelText:config.dynamicForms[mem].labelText,
              value:mem
            });
         }
         function CHANGE(){
            var fo={};
            ret.dynamicFormColl=new FORM_COL_OB(fo);
            var cat=ret.radioFamilyInp.COLL();
            if(cat){
               MAKE(ret.dynamicContainer, config.dynamicForms[cat].form, fo, RMFconcatName(RMFconcatName(config.nameStack,config.name), cat), config.dynamicForms[cat].config || false);
            }else{
               _el.EMPTY(ret.dynamicContainer);
            }
         } 
         ret.RADCHANGE=CHANGE;
         ret.inp=_el.CREATE("div", RMFid(config, "dynamicOnRadio"), RMFclass(config,"RMFdynamicOnRadio","dynamicOnRadio"), {},[
            ret.radioContainer=_el.CREATE('div',RMFid(config, "dynamicOnRadioRadioContainer"), RMFclass(config,"RMFdynamicOnRadioRadioContainer","dynamicOnRadioRadioContainer"),{
               onchange:function(){
                 CHANGE();
               }
            }),
            ret.dynamicContainer=_el.CREATE('div',RMFid(config, "dynamicOnRadioDynamicContainer"), RMFclass(config,"RMFdynamicOnRadioDynamicContainer","dynamicOnRadioDynamicContainer"))
         ]); 

         ret.radioFamilyInp=this.radioFamily(config.radioFamilyConfig);
         _el.APPEND(ret.radioContainer, ret.radioFamilyInp.el);
         CHANGE();
      },
      "section"//labelType
   ),
    "dynamicOnRadioFallthrough":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFdynamicOnRadioFallthrough",
        dynamicInps:{}, // placeHolder: a text to hold the place in the input
        radioFamilyConfig:{}, 
        
      },/// rmfdefault
      {},// rmfspecials
      function(){
         var nam=this.radioFamilyInp.COLL();
         var ret={};
         if(typeof this.dynamicInpColl.COLL !== "function"){
            return {};
         }
         return this.dynamicInpColl.COLL();
         return ret;
      },// COLL
      function(v){
         v=v || {};
         for(var mem in v)
         {
            this.radioFamilyInp.SET(mem);
            this.RADCHANGE();
            this.dynamicInpColl.SET(v[mem]);
         }
      },//SET
      function(config,ret){
         config.radioFamilyConfig.inps=[];
         config.radioFamilyConfig.name=config.name
         config.radioFamilyConfig.nameStack=config.nameStack;
         for(var mem in config.dynamicInps)
         {
            config.radioFamilyConfig.inps.push({
              labelText:config.dynamicInps[mem].labelText,
              value:mem
            });
         }
         function CHANGE(){
            var fo={};
            ret.dynamicFormColl=new FORM_COL_OB(fo);
            var cat=ret.radioFamilyInp.COLL();
            var dynamicInp=config.dynamicInps[cat];
            _el.EMPTY(ret.dynamicContainer);
            if(dynamicInp){
               ret.dynamicInpColl=INPTYPES[dynamicInp.inpType](_ob.COMBINE(dynamicInp.config, {nameStack:config.nameStack, name:config.name}));
               _el.APPEND(ret.dynamicContainer, ret.dynamicInpColl.el);
            }else{
               _el.EMPTY(ret.dynamicContainer);
            }
         } 
         ret.RADCHANGE=CHANGE;
         ret.inp=_el.CREATE("div", RMFid(config, "dynamicOnRadioFallthrough"), RMFclass(config,"RMFdynamicOnRadio","dynamicOnRadio"), {},[
            ret.radioContainer=_el.CREATE('div',RMFid(config, "dynamicOnRadioRadioContainer"), RMFclass(config,"RMFdynamicOnRadioRadioContainer","dynamicOnRadioRadioContainer"),{
               onchange:function(){
                 CHANGE();
               }
            }),
            ret.dynamicContainer=_el.CREATE('div',RMFid(config, "dynamicOnRadioDynamicContainer"), RMFclass(config,"RMFdynamicOnRadioDynamicContainer","dynamicOnRadioDynamicContainer"))
         ]); 

         ret.radioFamilyInp=this.radioFamily(config.radioFamilyConfig);
         _el.APPEND(ret.radioContainer, ret.radioFamilyInp.el);
         CHANGE();
      },
      "section"//labelType
   ),
    "dynamicOnSelect":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFdynamicOnSelect",
        dynamicForms:{}, // placeHolder: a text to hold the place in the input
        selectConfig:{}, 
        
      },/// rmfdefault
      {},// rmfspecials
      function(){
         var nam=this.selectInp.COLL();
         var ret={};
         ret[nam]=this.dynamicFormColl.COLL();
         return ret;
      },// COLL
      function(v){
         v=v || {};
         for(var mem in v)
         {
            this.selectInp.SET(mem);
            this.RADCHANGE();
            this.dynamicFormColl.SET(v[mem]);
         }
      },//SET
      function(config,ret){
         config.selectConfig.inps=[];
         config.selectConfig.name=config.name
         config.selectConfig.nameStack=config.nameStack;
         for(var mem in config.dynamicForms)
         {
            config.selectConfig.inps.push({
              labelText:config.dynamicForms[mem].labelText,
              value:mem
            });
         }
         function CHANGE(){
            var fo={};
            ret.dynamicFormColl=new FORM_COL_OB(fo);
            var cat=ret.selectInp.COLL();
            if(cat){
               MAKE(ret.dynamicContainer, config.dynamicForms[cat].form, fo, RMFconcatName(RMFconcatName(config.nameStack,config.name), cat), config.dynamicForms[cat].config || false);
            }else{
               _el.EMPTY(ret.dynamicContainer);
            }
         } 
         ret.RADCHANGE=CHANGE;
         ret.inp=_el.CREATE("div", RMFid(config, "dynamicOnSelect"), RMFclass(config,"RMFdynamicOnSelect","dynamicOnSelect"), {},[
            ret.selectContainer=_el.CREATE('div',RMFid(config, "dynamicOnSelectSelectContainer"), RMFclass(config,"RMFdynamicOnSelectSelectContainer","dynamicOnSelectSelectContainer"),{
               onchange:function(){
                 CHANGE();
               }
            }),
            ret.dynamicContainer=_el.CREATE('div',RMFid(config, "dynamicOnSelectDynamicContainer"), RMFclass(config,"RMFdynamicOnSelectDynamicContainer","dynamicOnSelectDynamicContainer"))
         ]); 

         ret.selectInp=this.select(config.selectConfig);
         _el.APPEND(ret.selectContainer, ret.selectInp.el);
         CHANGE();
      },
      "section"//labelType
   ),
   "dynamicOnSelectFallthrough":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFdynamicOnSelectFallthrough",
        dynamicInps:{},
        selectConfig:{}
        
      },/// rmfdefault
      {},// rmfspecials
      function(){
         var nam=this.selectInp.COLL();
         var ret={};
         if(typeof this.dynamicInpColl.COLL !== "function"){return {};}
         return this.dynamicInpColl.COLL();
         return ret;
      },// COLL
      function(v){
         v=v || {};
         for(var mem in v)
         {
            this.selectInp.SET(mem);
            this.RADCHANGE();
            this.dynamicInpColl.SET(v[mem]);
         }
      },//SET
      function(config,ret){
         config.selectConfig.inps=[];
         config.selectConfig.name=config.name;
         config.selectConfig.nameStack=config.nameStack;
         for(var mem in config.dynamicInps)
         {
            config.selectConfig.inps.push({
              labelText:config.dynamicInps[mem].labelText,
              value:mem
            });
         }
         function CHANGE(){
            _el.EMPTY(ret.dynamicContainer);
            var cat=ret.selectInp.COLL();
            var dynamicInp=config.dynamicInps[cat];
            if(dynamicInp){
               ret.dynamicInpColl=INPTYPES[dynamicInp.inpType](_ob.COMBINE(dynamicInp.config || {} , {name:config.name, formCol:config.formCol, nameStack:config.nameStack}));
               _el.APPEND(ret.dynamicContainer,ret.dynamicInpColl.el);
            }else{
               _el.EMPTY(ret.dynamicContainer);
            }
         } 
         ret.RADCHANGE=CHANGE;
         ret.inp=_el.CREATE("div", RMFid(config, "dynamicOnSelectFallthrough"), RMFclass(config,"RMFdynamicOnSelectFallthrough","dynamicOnSelectFallthrough"), {},[
            ret.selectContainer=_el.CREATE('div',RMFid(config, "dynamicOnSelectFallthroughSelectContainer"), RMFclass(config,"RMFdynamicOnSelectFallthroughSelectContainer","dynamicOnSelectFallthroughSelectContainer"),{
               onchange:function(){
                 CHANGE();
               }
            }),
            ret.dynamicContainer=_el.CREATE('div',RMFid(config, "dynamicOnSelectFallthroughDynamicContainer"), RMFclass(config,"RMFdynamicOnSelectFallthroughDynamicContainer","dynamicOnSelectFallthroughDynamicContainer"))
         ]); 

         ret.selectInp=this.select(config.selectConfig);
         _el.APPEND(ret.selectContainer, ret.selectInp.el);
         CHANGE();
      },
      "section"//labelType
   ),
   "dynamicOnCheckbox":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFdynamicOnCheckbox",
        checkboxConfig:{},
        dynamicForm:[],
        dynamicFormConfig:{}
         
      },/// rmfdefault
      {},// rmfspecials
      function(){
         if(this.checkboxInp.COLL()){
            return this.dynamicFormColl.COLL();
         }return false;
      },// COLL
      function(a){
         if(a){
            this.checkboxInp.SET(true);
            this.REFCHANGE();
            this.dynamicFormColl.SET(a);
         }else{
            this.checkboxInp.SET(false);
            this.REFCHANGE();
         }
      },//SET
      function(config,ret){
        // console.log(config);
         function CHANGE(){
            _el.EMPTY(ret.dynamicContainer);
            var fo={};
            ret.dynamicFormColl=new FORM_COL_OB(fo);
            var cat=ret.checkboxInp.COLL();
            _el.EMPTY(ret.dynamicContainer);
            if(cat){
               MAKE(ret.dynamicContainer, config.dynamicForm, fo, RMFconcatName(config.nameStack,config.name), config.dynamicFormConfig || false);
            }
         }
         ret.REFCHANGE=CHANGE;
         ret.inp=_el.CREATE("div", RMFid(config, "dynamicOnCheckbox"), RMFclass(config,"RMFdynamicOnCheckbox","dynamicOnCheckbox"), {}); 
         ret.checkboxInp=this.checkbox(_ob.COMBINE(config.checkboxConfig,{name:config.name,nameStack:config.nameStack, formCol:config.formCol}));
         ret.checkboxInp.inp.onchange=function(){CHANGE();}
         _el.APPEND(ret.inp, [
            ret.checkboxInp.el,
            ret.dynamicContainer=_el.CREATE('div',RMFid(config, "dynamicOnCheckboxDynamicContainer"), RMFclass(config,"RMFdynamicOnCheckboxDynamicContainer","dynamicOnCheckboxDynamicContainer"),{})
         ]);
         CHANGE();
      },
      "section"//labelType
   ),
   "dynamicOnCheckboxFallthrough":RMFbasicInput(
      {
        /*COMES WITH THESE BY DEFAULT*/
        /*
          name:name for Input
            id: id for input ("")
            class:class for input("")
            default: default setting ("")
            labelText: text for label ("")
            labelSequence: whether the label text should appear before or after the input (true)
            errorText: text for error ("")
            errorSequence: whether the error text should appear before or after the input (false)
        */
        classRunner:"RMFdynamicOnCheckboxFallthrough",
        checkboxConfig:{},
        inpType:"singleLine",
        inpTypeConfig:{}
         
      },/// rmfdefault
      {},// rmfspecials
      function(){
         if(this.checkboxInp.COLL()){
           if(this.dynamicInp.COLL){
            return this.dynamicInp.COLL();
           }
         }return false;
      },// COLL
      function(a){
         if(a){
            this.checkboxInp.SET(true);
            this.REFCHANGE();
            this.dynamicInp.SET(a);
         }else{
            this.checkboxInp.SET(false);
            this.REFCHANGE();
         }
      },//SET
      function(config,ret){
         //console.log("cbf beg ", config);
         config.inpTypeConfig.formCol=config.formCol;
         config.inpTypeConfig.name=config.inpTypeConfig.name || config.name;
         config.inpTypeConfig.nameStack=config.nameStack;
         function CHANGE(){
            _el.EMPTY(ret.dynamicContainer);
            var cat=ret.checkboxInp.COLL();
            _el.EMPTY(ret.dynamicContainer);
            ret.dynamicInp=false;
            if(cat){
               //console.log("from checkbox fallthrough ", config.inpTypeConfig, config.inpType);
               ret.dynamicInp=INPTYPES[config.inpType](config.inpTypeConfig);
               _el.APPEND(ret.dynamicContainer, ret.dynamicInp.el);
            }
         }
         ret.REFCHANGE=CHANGE;
         ret.inp=_el.CREATE("div", RMFid(config, "dynamicOnCheckboxFallthrough"), RMFclass(config,"RMFdynamicOnCheckboxFallthrough","dynamicOnCheckboxFallthrough"), {}); 
         ret.checkboxInp=this.checkbox(_ob.COMBINE(config.checkboxConfig,{name:config.name,nameStack:config.nameStack, formCol:config.formCol}));
         ret.checkboxInp.inp.onchange=function(){CHANGE();}
         _el.APPEND(ret.inp, [
            ret.checkboxInp.el,
            ret.dynamicContainer=_el.CREATE('div',RMFid(config, "dynamicOnCheckboxFallthroughDynamicContainer"), RMFclass(config,"RMFdynamicOnCheckboxFallthroughDynamicContainer","dynamicOnCheckboxFallthroughDynamicContainer"),{})
         ]);
         CHANGE();
      },
      "section"//labelType
   ),
   "button":function(config){
      /*config
          text: text to be in button
          action: function to fire on button press
          class:
          id:
      */
      var ret={
         el:_el.CREATE('input',RMFid(config, ""), RMFclass(config,"RMFbutton","button"),{
            type:'button',
            onclick:function(e){config.action(this, e);},
            value:config.text
         },[]),
         action:config.action
      };
      return ret;
   },
   "hidden":function(config){
      /*
          value:,
          name:
          class:
          id
      */
       config=config || {};
       
       return {
          el:_el.CREATE('input',RMFid(config, ""), RMFclass(config,"RMFhidden","'hidden"),{name:config.name, type:"hidden", value:config.value}),
          COLL:function(){return config.value;},
          SET:function(a){config.value=a;}
       };
   },
   "dummy":function(config){
      return _ob.COMBINE({
         
          el:_el.CREATE('input',RMFid(config, ""), RMFclass(config,"RMFhidden","'hidden"),{name:config.name, type:"hidden", value:config.value}),
      },config);
   },
   "hider":function(config){
      config=config || {};
      function OPEN(){
          STATE=1;
          ret.labelTextBox.innerHTML=config.labelText+" ";
          ret.inp.className=ret.inp.className.replace(/RMFhiderClosed/g).trim();
          _el.APPEND(ret.labelTextBox, _el.CREATE('input','','RMFhiderButton',{type:"button",value:"^"}));
      };
      function CLOSE(){
         STATE=0;
         ret.labelTextBox.innerHTML=config.labelText+" ";
         _el.APPEND(ret.labelTextBox, _el.CREATE('input',"","RMFhiderButton",{type:"button", value:"V"}));
         ret.inp.className+=" RMFhiderClosed";
      };
      var STATE=0;
      function TOGGLE(){
         if(STATE){
            return CLOSE();
         }return OPEN();
      }
      
      var ret=this.section(config);

      
      ret.labelTextBox.onclick=function(){TOGGLE();}
      ret.labelTextBox.className+=" RMFhiderLabel";
      CLOSE();

      return ret;
   },
   "compoundHider":function(config){
      config=config || {};
      function OPEN(){
          STATE=1;
          ret.labelTextBox.innerHTML=config.labelText+" ";
          ret.inp.className=ret.inp.className.replace(/RMFhiderClosed/g).trim();
          _el.APPEND(ret.labelTextBox, _el.CREATE('input','','RMFhiderButton',{type:"button",value:"^"}));
      };
      function CLOSE(){
         STATE=0;
         ret.labelTextBox.innerHTML=config.labelText+" ";
         _el.APPEND(ret.labelTextBox, _el.CREATE('input',"","RMFhiderButton",{type:"button", value:"V"}));
         ret.inp.className+=" RMFhiderClosed";
      };
      var STATE=0;
      function TOGGLE(){
         if(STATE){
            return CLOSE();
         }return OPEN();
      }
      
      var ret=this.compound(config);

      
      ret.labelTextBox.onclick=function(){TOGGLE();}
      ret.labelTextBox.className+=" RMFhiderLabel";
      CLOSE();

      return ret;
   },
   "sectionHider":function(config){
      config=config || {};
      function OPEN(){
          STATE=1;
          ret.labelTextBox.innerHTML=config.labelText+" ";
          ret.inp.className=ret.inp.className.replace(/RMFhiderClosed/g).trim();
          _el.APPEND(ret.labelTextBox, _el.CREATE('input','','RMFhiderButton',{type:"button",value:"^"}));
      };
      function CLOSE(){
         STATE=0;
         ret.labelTextBox.innerHTML=config.labelText+" ";
         _el.APPEND(ret.labelTextBox, _el.CREATE('input',"","RMFhiderButton",{type:"button", value:"V"}));
         ret.inp.className+=" RMFhiderClosed";
      };
      var STATE=0;
      function TOGGLE(){
         if(STATE){
            return CLOSE();
         }return OPEN();
      }
      
      var ret=this.section(config);

      
      ret.labelTextBox.onclick=function(e){e.preventDefault(); e.cancelBubble=true;TOGGLE();}
      ret.labelTextBox.className+=" RMFhiderLabel";
      CLOSE();

      return ret;
   }
};

INPTYPES_inpLists={
    'TBL_jipper':[
        {
           'type':'singleLine',
            name:'yo',
            labelText:'YYou'
        }
    ]
};
INPTYPES.TBL_jipper= RMFbasicMultiInput('', '', '', INPTYPES_inpLists.TBL_jipper, '');


function MODAL_NOW(){
   var ret={
       CLOSE:function(){
          _el.REMOVE(this.parent);
       }
   };
   ret.parent=_el.CREATE("div","","basicModalParent",{},[
      ret.backer=_el.CREATE("div","","basicModalBacker",{},[]),
      ret.client=_el.CREATE("div","","basicModalClient",{},[]),
      ret.closer=_el.CREATE('div','','basicModalCloser',{
        onclick:function(){ret.CLOSE();}
      },[_el.TEXT('X')])
   ]);
   _el.APPEND(el_body, ret.parent);
   return ret;
}

function TableSearchAdd(inpRet,config,forEdit){
   var mod=MODAL_NOW();
   var catcher;
   var dd;
   if(config.addApName){
      dd=new dFCM('RMF/'+config.typeName+'/action.php?action='+config.addApName, {method:'POST', headers:{'Content-Type':'special/obPost'}});
   }else{
      dd=new dFCM(config.addFile || 'php_core/globalAdd.php?typeName='+config.typeName, {method:'POST', headers:{'Content-Type':'special/obPost'}});
   }
   var inpL=[];
   if(config.inpList){
      inpL=config.inpList;
   }else if(config.addApName){
       inpL=INPTYPES_inpLists[config.typeName+config.addApName];
   }else{
      inpL=INPTYPES_inpLists[config.typeName];
   }
    var FO=RMFORM(
     mod.client,
     inpL,
     config.typeName+(config.addApName || 'add'),
     {
        ajaxDacm:dd,
        ajaxProc:function(res){
           _el.EMPTY(catcher);
           if(res === "SUCCESS"){
                 
              
              var temp=CARDTYPES.GET(config.cardName || config.typeName, FO.COLL(), 2);
              temp.className+=' tableAddResult';

              temp.onclick=function(){
                 inpRet.SET(FO.COLL());
                 mod.CLOSE();
              }
              _el.APPEND(catcher,temp);
           }else{
              _el.APPEND(catcher, _el.TEXT(res));
           }

           
        }
     }
   );
   _el.APPEND(mod.client,
      catcher=_el.CREATE("div","",'',{},[
         
      ])
   );
}

function TableSearchSearch(inpRet, config, forEdit){
   var mod = MODAL_NOW();
   var catcher;
   var dd;
   if(config.apName){
      dd=new dFCM('RMF/'+config.typeName+'/action.php?action='+config.apName, {method:'POST', headers:{'Content-Type':'special/obPost'}});
   }else{
      dd=new dFCM(config.searchFile || 'php_core/globalSearch.php?typeName='+config.typeName, {method:'POST', headers:{'Content-Type':'special/obPost'}});
   }
   var inpL=[];
   if(config.inpList){
      inpL=config.inpList;
   }else if(config.apName){
       inpL=INPTYPES_inpLists[config.typeName+config.apName];
   }else{
      inpL=INPTYPES_inpLists[config.typeName];
   }
   RMFORM(
     mod.client,
     inpL,
     config.typeName+(config.apName || 'search'),
     {
        ajaxDacm:dd,
        ajaxProc:function(res){
           _el.EMPTY(catcher);
           res=JSON.parse(res);
           
           for(var i=0; i<res.length; i++)
           {
              var temp=CARDTYPES.GET(config.cardName || config.typeName, res[i], 2);
              temp.className+=' tableSearchResult';
              temp.DATA_res=res[i];
              temp.onclick=function(){
                 inpRet.SET(this.DATA_res);
                 mod.CLOSE();
              }
              _el.APPEND(catcher,temp);
           }

           
        }
     }
   );
   _el.APPEND(mod.client,
      catcher=_el.CREATE("div","",'',{},[
         
      ])
   );
}
function TableSearchAp(apName, inpRet, config){
   var mod = MODAL_NOW();
   var catcher;
   var dd;
   var FO=RMF_actionProcedureForm(apName, config.typeName,mod.client, "mod"+config.typeName+apName, {
      ajaxProc:function(res){
         if(res === "SUCCESS"){
            alert("success");
            inpRet.SET(FO.COLL());
            mod.CLOSE();
         }else{
             var tRes;
             try{
               tRes=JSON.parse(res);
               inpRet.SET(res);
               mod.CLOSE();
             }catch(e){
               _el.EMPTY(catcher); 
               _el.APPEND(catcher, _el.TEXT(res));
             }
         }
      }
   });
  
   _el.APPEND(mod.client,
      catcher=_el.CREATE("div","",'',{},[
         
      ])
   );
}
INPTYPES.tableSearch=function(config){
   var ret;
   if(config.inps){
      ret=this.compound(_ob.COMBINE(config,{
         class:'tableSearch'
      }));
   }else{
      ret= this[config.typeName](_ob.COMBINE(config,{class:'tableSearch'}));
   }
   ret.el.insertBefore(_el.CREATE('input','','',{type:'button', value:'Search', onclick:function(){
      TableSearchSearch(ret,config);
   }}), ret.el.children[0]);

   if(config.includeAdd){
      ret.el.insertBefore(_el.CREATE('input','','',{type:'button', value:'Add', onclick:function(){
         TableSearchAdd(ret,config);
      }}), ret.el.children[0]);
   }

   if(config.apButtons){
      config.apButtons.forEach(function(a){
         ret.el.insertBefore(_el.CREATE('input','','',{type:'button',value:'add', onclick:function(){
            TableSearchAp(a, ret,config);
         }}),ret.el.children[0])
      });
   }
   ret.oldCOLL=ret.COLL;
   ret.COLL=function(){
	   var r=this.oldCOLL();
	   var found=false;
	   for(var mem in r)
	   {
		   if(typeof r[mem] !== 'boolean' && r[mem]){found=true; break;}
	   }
	   if(!found){return {};}
	   return r;
   }
   return ret;
}

INPTYPES.tableSearchForEdit=function(config){   
   var ret;
   /*if(config.inps){
      ret=this.compound(_ob.COMBINE(config,{
         class:'tableSearch'
      }));
   }else{
      ret= this[config.typeName](_ob.COMBINE(config,{class:'tableSearch'}));
   }
   ret.el.insertBefore(_el.CREATE('input','','',{type:'button', value:'Search', onclick:function(){
      TableSearchSearch(ret,config,true);
   }}), ret.el.children[0]);*/
   ret=this.tableSearch(config);
   ret.TABLESEARCHFOREDITOLDSET=ret.SET;
   ret.SET=function(v){
      if(v){
        v.OGvalue=_ob.CLONE(v);
      }
      ret.TABLESEARCHFOREDITOLDSET(v);
   }
   return ret;
   
}
INPTYPES.tableEditBasic=function(config){
   var ret=this.section(config);
   /*ret.TABLEEDITBASICSET=ret.SET;
   ret.SET=function(v){
      if(v){
         v.OGvalue=_ob.CLONE(v);
      }
      this.TABLEEDITBASICSET(v);
   }*/
   
   return ret;
}

var INPTYPEOVERRIDE={
 
};

for(var mem in INPTYPEOVERRIDE)
{
   INPTYPES[mem]=INPTYPEOVERRIDE[mem];
}
function RMFgetCard(config,level){
   return CARDTYPES.GET(config.dataType || "", config.data || config.labelText || config.text || "", level || 0);
}

var CARDTYPES={
   GET:function(type, data, level){
      if(this[type]){
         return this[type](data, level);
      }return this.BASIC(data,level);
   },
   BASIC:function(data, level){
      //alert("here"+data)
      var txt;
      if(typeof data !== "object"){
         txt= _el.TEXT(data);
      }else{
         txt= _el.TEXT(''+JSON.stringify(data));
      }
      return _el.CREATE('span','','cardBasic',{},[txt]);
   },
   CURRY:function(type){
     var t=this;
     return function(data, level){
        return t.GET(type, data, level);
     }
   }
}

function RMFgetValue(config){
   if(config.data && config.dataType){
      return VALUETYPES.GET(config.dataType, config.data);
   }return config.value || "";
}

var VALUETYPES={
   GET:function(type, data){
      if(this[type]){
         return this[type](data);
      }return this.BASIC(data);
   },
   BASIC:function(data){
     if(typeof data === "object"){
        if(data.pk){
           return data.pk;
        }return JSON.stringify(data);
     }return ''+data;
   }
}

var RMF_makeTypeStack=[];
function MAKE(target, inps, formCol, nameStack, inpsConfig){
   nameStack=nameStack || "";
   inpsConfig= inpsConfig || {};
   var RMF_typeStackLength=RMF_makeTypeStack.length;
  // alert(nameStack+" "+JSON.stringify(inpsConfig));
   _el.EMPTY(target);
   for(var i=0; i<inps.length; i++)
   {
      RMF_makeTypeStack.splice(RMF_typeStackLength+1);
      //console.log(inps[i].type);
      var tp;
      if(['tableSearch', 'tableSearchForEdit'].indexOf(inps[i].type)> -1){
         tp=inps[i].typeName;
      }else{
         tp=inps[i].type;
      }
      if(tp.match(/^TBL_/) && RMF_makeTypeStack.indexOf(tp) > -1){
         continue;
      }
      RMF_makeTypeStack[RMF_typeStackLength]=tp;
      

      inps[i].nameStack=nameStack;
      inps[i].formCol=formCol;
     // alert(inps[i].name+": "+JSON.stringify(inpsConfig[inps[i].name]));
      var temp=INPTYPES[inps[i].type](_ob.COMBINE(inps[i], inpsConfig[inps[i].name] || {}));
      if(temp.COLL){
         formCol[inps[i].name]=temp;
      }
      _el.APPEND(target, temp.el);
   }
   RMF_makeTypeStack.splice(RMF_typeStackLength);
}

function RMF_fcCOLL(){
     var col = {};
         for(var mem in this)
         {
             if(this[mem]  && this[mem].COLL){
                col[mem]=this[mem].COLL();
             }
         }
         return col;
}
function RMF_fcSET(v){
   v= v || {};
   
   for(var mem in this)
   {
      if(v[mem] && this[mem]  && this[mem].SET){
         this[mem].SET(v[mem]);
      }
   }
   
}
function FORM_COL_OB(formCol){
   this.formCol=formCol;
   this.formCol.SET=RMF_fcSET;
   this.formCol.COLL=RMF_fcCOLL;
   this.formCol.IS_subFColl=true;
}
FORM_COL_OB.prototype.COLL=function(){
   
         var col={};
         for(var mem in this.formCol)
         {
             if(this.formCol[mem] &&  this.formCol[mem].COLL){
                col[mem]=this.formCol[mem].COLL();
             }
         }
         return col;
}
FORM_COL_OB.prototype.SET=function(v){
   v= v || {};
   
   for(var mem in this.formCol)
   {
	   /* this typeof undefined check could break things later that 
	   depend on this library. The check used to just be for if v[mem] was falsey
	   but empty strings and boolean false for checkboxes failed and integer 0. As well as the integer zero.
	   We will see what happens. 
	   
	   This check here is more what was desired. If nothing exists do not call SET. 
	   
	   If something breaks, we will need to make a splinter for the site generator. This check is not acceptable for the site generator, because of all of the checkboxes.
	   
	   */
      if(typeof v[mem] !== "undefined" && v[mem] !== null && this.formCol[mem]  && this.formCol[mem].SET){
         this.formCol[mem].SET(v[mem]);
      }
   }
}
FORM_COL_OB.prototype.SETforEdit=function(v){
   v=v || {};
   v.OGvalue=_ob.CLONE(v);
   this.SET(v);
}
FORM_COL_OB.prototype.SUBMIT=function(e){
   e=e || new Event("submit");
   this.form.onsubmit.call(this.form,e);
}
function RMFORM(target, inps, name, config){
   name=name || "defaultName";
   config=config || {};

   config.method=config.method || "POST";
   config.action=config.action || "";
   config.ajaxAction=config.ajaxAction || "";
   config.ajaxMethod=config.ajaxMethod || "POST";
   config.ajaxProc=config.ajaxProc || DUMMY_FUNCT;
   config.useModal=config.useModal || false;
   config.ajaxDacm=config.ajaxDacm || false;
   config.header=config.header || "";
   config.headerLevel=config.headerLevel || 1;
   config.submitFilter=config.submitFilter || function(a){return a;}

   var lockout=false;
   var formCol={};
   var ret=new FORM_COL_OB(formCol);

   _el.APPEND(target,[
      ret.form=_el.CREATE("form", "FORM-"+name,"",{
         action:config.action,
         method:config.method
      })
   ]);

   if(config.header){
      inps=_ob.CLONE(inps);
      inps.unshift({
        type:"header",
        text:config.header,
        level:config.headerLevel
      });
   }
   //alert("HHHHHH "+JSON.stringify(inps)+" .... "+JSON.stringify(config.inpsConfig));
   MAKE(ret.form, inps, formCol, name, config.inpsConfig);

   var osFunct="";
   
   if(config.ajaxAction || config.ajaxDacm){
     osFunct=function(e){
        e.preventDefault(); e.cancelBubble=true;
        var target;
        var dd;
        if(config.localProc){
           return localProc(ret.COLL());
           
        }

        if(config.ajaxDacm){
           dd=config.ajaxDacm;
        }else{
			
           dd=new dFCM(config.ajaxAction, {method:'POST', useFormData:true});
        }
        if(lockout){return;}
        if(config.useModal && dd){
            var modStr="Talking to "+dd.file+"... ";
            
            var modalHolder=RMF_MODAL(modStr);
            target=modalHolder.ticker;
        }else{
           target=this.parentNode;
        }
        dd.CAPTURE(config.viewController || VCR.main, target);
        lockout=true;
        dd.CALL_data(function(res){
      //      alert("sent");
         //  alert("from send: "+res);
           lockout=false;
           config.ajaxProc(res);
           if(config.useModal){
              modalHolder.CLOSE();
           }
        },{dat:config.submitFilter(ret.COLL())});
       // alert(JSON.stringify(ret.COLL()));
       
     }
   }

   if(config.collProc){
      ret.collProc=config.collProc;
      osFunct=function(e){
        e.preventDefault(); e.cancelBubble=true;
        config.collProc(ret.COLL());
      }
   }

   ret.form.onsubmit=osFunct;
   _el.APPEND(ret.form, _el.CREATE('button','','rmfSubmitButton',{},['Submit']));
   
   return ret;

}
var RMF_MODAL=function(text){
   
   var ret={
      CLOSE:function(){ _el.REMOVE(this.wrapper);},
      APPEND:function(v){_el.APPEND(this.appendage, v)}
   };

    ret.wrapper=_el.CREATE('div','','RMF_modalWrapper',{},[
       ret.backer=_el.CREATE('div','','RMF_modalBacker'),
       ret.client=_el.CREATE('div','','RMF_modalClient',{},[
          ret.ticker=_el.CREATE('div','','RMF_modalTicker'),
          ret.appendage=_el.CREATE('div','','RMF_modalAppendage')
       ])
    ]);
    ret.APPEND(_el.TEXT(text));
   _el.APPEND(el_body, ret.wrapper);
   return ret;
}
// functions that call the FORM function with certain configurations

function RMF_typeForm(typeName,target, name, config){
   return RMFORM(target, name, INPTYPES[typeName], config);
}

function RMF_actionProcedureForm(action, typeName,target, name, config){
   var dd=new dFCM("/RMF/"+typeName+"/action.php?action="+action, {method:'POST', headers:{'Content-Type':'special/obPost'}});
   
   config.ajaxDacm=dd;
 
   return RMFORM(target, INPTYPES_inpLists[typeName+action],name,config);
}

