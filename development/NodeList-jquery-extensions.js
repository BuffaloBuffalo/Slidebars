//NodeList extensions to make is play nicely with jquery porting
define(['dojo/_base/array',
	'dojo/_base/lang',
	'dojo/dom-class',
	'dojo/dom-style',
	'dojo/NodeList'],function(array,lang,domClass,domStyle,NodeList){

	lang.extend(NodeList,{
		css:function(prop,value){
			if(value==undefined){
				return this.length>0 ? domStyle.get(this[0]	,prop):null;
			}
			array.forEach(this,function(node){
				domStyle.set(node,prop,value);
			});
			return this;
		},
		hasClass:function(className){
			return array.every(this,function(node){
				return domClass.contains(node,className);
			});
		},
		add:function(nodes){
			if(nodes && typeof nodes.length == 'undefined'){
				nodes = [nodes];
			}
			array.forEach(nodes,function(node){
				this.push(node);
			},this);
			return this;
		}
	});
	return NodeList;
});