
// internal libs
import View from '../libs/view';

// external libs
import { Object } from 'core-js/library';

/*****************************************
 * ######### Public Decorators ###########
 *****************************************/

/**
 * Register View
 * @param  {String} template
 * @param  {String} templateName
 * @return {Function}
 */
function view(template, templateName = 'base') {

	if(!template) {
		throw new Exception('Please pass a template!');
	}

	return (Class, name) => {

		let target = Class.prototype;

		// register Template
		view.helper.registerTemplate(target, template, templateName);

		// register view engine that initialized on called createdCallback
		view.helper.registerOnCreatedCallback(target, ( domNode, createVars = {} ) => {

			if(!domNode.$){
				domNode.$ = {};
			}

			domNode.$.view = new View({
				domNode: domNode,
				vars: Object.assign({}, domNode.$appDecorators.view.bind, createVars),
				template : {
					base: target.$appDecorators.view.template[templateName],
				},
			});

			domNode.$.view.render();

		});

		// register proxy that initialized on called createdCallback
		view.helper.registerOnCreatedCallback(target, ( domNode, createVars = {} ) => {

			let properties = {};
			for(let property in target.$appDecorators.view.bind){
				properties[property] = {
					set: function(newValue){
						this.$.view.set(property, newValue);
						this.$.view.render();
					}
				}
			}
			// register setter (@view.bind properties)
			Object.defineProperties(domNode, properties);
		});

	}
}

/**
 * Register view vars
 * @param  {Object} target
 * @param  {String} property
 * @param  {Object} descriptor
 * @return {undefined}
 */
view.bind = (target, property, descriptor) => {

	// get default value
	let value = descriptor.initializer ? descriptor.initializer() : '';
	view.helper.registerBind(target, property, value);

};

/*****************************************
 * ########## Decorator Helper ###########
 *****************************************/

// define namespace
view.helper = {};

/**
 * Register @bind of view decorator
 * @param  {Function|Objet} target
 * @param  {String} property
 * @param  {String} value
 * @return {Object} target
 */
view.helper.registerBind = (target, property, value) => {

	// define namespaces
	view.helper.registerNamespaces(target);

	// define @view.bind property/value
	target.$appDecorators.view.bind[property] = value;

	return target;

}

/**
 * Register @bind of view decorator
 * @param  {Function|Objet} target
 * @param  {String} template
 * @param  {String} templateName
 * @return {Function} target
 */
view.helper.registerTemplate = (target, template, templateName = 'base') => {

	// define namespaces
	view.helper.registerNamespaces(target);

	// add template
	target.$appDecorators.view.template[templateName] = template;

	return target;

}

/**
 * Register on created callback
 * @param  {[type]}   target   [description]
 * @param  {Function} callback [description]
 * @return {Function} target
 */
view.helper.registerOnCreatedCallback = (target, callback) => {

	// define $onCreated callbacks
	if(!target.$onCreated) {
		target.$onCreated = [];
	}

	// init render engine
	target.$onCreated.push(callback);

	return target;

}

/**
 * Register namespace of view decorator
 * @param  {Function|Objet} target
 * @return {Function} target
 */
view.helper.registerNamespaces = (target) => {

	// if namespace already exists do nothing
	if(target.$appDecorators && target.$appDecorators.view){
		return target;
	}

	// define namespace
	target.$appDecorators = {
		view: {
			bind: {},
			template: {},
		},
	};

	return target;
}

export default view;
