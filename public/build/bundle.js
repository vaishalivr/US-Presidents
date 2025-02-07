
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/onePresidentUnit.svelte generated by Svelte v3.59.2 */

    const file$2 = "src/components/onePresidentUnit.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (43:0) {#each arcs as arc, i}
    function create_each_block$1(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;
    	let path_stroke_width_value;
    	let mounted;
    	let dispose;

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[13](/*i*/ ctx[21]);
    	}

    	function mouseout_handler() {
    		return /*mouseout_handler*/ ctx[14](/*i*/ ctx[21]);
    	}

    	function focus_handler() {
    		return /*focus_handler*/ ctx[15](/*i*/ ctx[21]);
    	}

    	function blur_handler() {
    		return /*blur_handler*/ ctx[16](/*i*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*arc*/ ctx[19].d);
    			attr_dev(path, "fill", path_fill_value = /*arc*/ ctx[19].fill);
    			attr_dev(path, "stroke", "black");
    			attr_dev(path, "stroke-width", path_stroke_width_value = /*arc*/ ctx[19].strokeWidth);
    			attr_dev(path, "tabindex", "0");
    			attr_dev(path, "role", "button");
    			add_location(path, file$2, 43, 2, 1132);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(path, "mouseover", mouseover_handler, false, false, false, false),
    					listen_dev(path, "mouseout", mouseout_handler, false, false, false, false),
    					listen_dev(path, "focus", focus_handler, false, false, false, false),
    					listen_dev(path, "blur", blur_handler, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*arcs*/ 8 && path_d_value !== (path_d_value = /*arc*/ ctx[19].d)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*arcs*/ 8 && path_fill_value !== (path_fill_value = /*arc*/ ctx[19].fill)) {
    				attr_dev(path, "fill", path_fill_value);
    			}

    			if (dirty & /*arcs*/ 8 && path_stroke_width_value !== (path_stroke_width_value = /*arc*/ ctx[19].strokeWidth)) {
    				attr_dev(path, "stroke-width", path_stroke_width_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(43:0) {#each arcs as arc, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0;
    	let circle0;
    	let t1;
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;
    	let t2;
    	let circle1;
    	let circle1_cx_value;
    	let circle1_cy_value;
    	let t3;
    	let text_1;
    	let t4;
    	let text_1_x_value;
    	let text_1_y_value;
    	let each_value = /*arcs*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			circle0 = svg_element("circle");
    			t1 = space();
    			line = svg_element("line");
    			t2 = space();
    			circle1 = svg_element("circle");
    			t3 = space();
    			text_1 = svg_element("text");
    			t4 = text(/*name*/ ctx[2]);
    			attr_dev(circle0, "cx", /*cx*/ ctx[0]);
    			attr_dev(circle0, "cy", /*cy*/ ctx[1]);
    			attr_dev(circle0, "r", /*innerRadius*/ ctx[5]);
    			attr_dev(circle0, "fill", /*fill*/ ctx[6]);
    			attr_dev(circle0, "stroke", /*stroke*/ ctx[7]);
    			attr_dev(circle0, "stroke-width", /*strokeWidth*/ ctx[8]);
    			add_location(circle0, file$2, 57, 0, 1489);
    			attr_dev(line, "x1", line_x__value = /*lineCoords*/ ctx[4].x1);
    			attr_dev(line, "y1", line_y__value = /*lineCoords*/ ctx[4].y1);
    			attr_dev(line, "x2", line_x__value_1 = /*lineCoords*/ ctx[4].x2);
    			attr_dev(line, "y2", line_y__value_1 = /*lineCoords*/ ctx[4].y2);
    			attr_dev(line, "stroke", /*stroke*/ ctx[7]);
    			attr_dev(line, "stroke-width", /*strokeWidth*/ ctx[8]);
    			add_location(line, file$2, 59, 0, 1570);
    			attr_dev(circle1, "cx", circle1_cx_value = /*lineCoords*/ ctx[4].x1);
    			attr_dev(circle1, "cy", circle1_cy_value = /*lineCoords*/ ctx[4].y1);
    			attr_dev(circle1, "r", "3");
    			attr_dev(circle1, "fill", "black");
    			add_location(circle1, file$2, 68, 0, 1704);
    			attr_dev(text_1, "x", text_1_x_value = (/*lineCoords*/ ctx[4].x1 + /*lineCoords*/ ctx[4].x2) / 2);
    			attr_dev(text_1, "y", text_1_y_value = /*lineCoords*/ ctx[4].y1 - 5);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "12px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$2, 70, 0, 1773);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, circle0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, line, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, circle1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*arcs, updateFillColor, hoverFill, defaultFill*/ 3592) {
    				each_value = /*arcs*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t0.parentNode, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*cx*/ 1) {
    				attr_dev(circle0, "cx", /*cx*/ ctx[0]);
    			}

    			if (dirty & /*cy*/ 2) {
    				attr_dev(circle0, "cy", /*cy*/ ctx[1]);
    			}

    			if (dirty & /*lineCoords*/ 16 && line_x__value !== (line_x__value = /*lineCoords*/ ctx[4].x1)) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*lineCoords*/ 16 && line_y__value !== (line_y__value = /*lineCoords*/ ctx[4].y1)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*lineCoords*/ 16 && line_x__value_1 !== (line_x__value_1 = /*lineCoords*/ ctx[4].x2)) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*lineCoords*/ 16 && line_y__value_1 !== (line_y__value_1 = /*lineCoords*/ ctx[4].y2)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*lineCoords*/ 16 && circle1_cx_value !== (circle1_cx_value = /*lineCoords*/ ctx[4].x1)) {
    				attr_dev(circle1, "cx", circle1_cx_value);
    			}

    			if (dirty & /*lineCoords*/ 16 && circle1_cy_value !== (circle1_cy_value = /*lineCoords*/ ctx[4].y1)) {
    				attr_dev(circle1, "cy", circle1_cy_value);
    			}

    			if (dirty & /*name*/ 4) set_data_dev(t4, /*name*/ ctx[2]);

    			if (dirty & /*lineCoords*/ 16 && text_1_x_value !== (text_1_x_value = (/*lineCoords*/ ctx[4].x1 + /*lineCoords*/ ctx[4].x2) / 2)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*lineCoords*/ 16 && text_1_y_value !== (text_1_y_value = /*lineCoords*/ ctx[4].y1 - 5)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(circle0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(line);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(circle1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let lineCoords;
    	let arcs;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OnePresidentUnit', slots, []);
    	let { cx } = $$props;
    	let { cy } = $$props;
    	let { parts } = $$props;
    	let { name } = $$props;
    	let innerRadius = 40;
    	let outerRadius = 60;
    	let fill = "white";
    	let stroke = "black";
    	let strokeWidth = 1;
    	let defaultStrokeWidth = 3;
    	let defaultFill = "white";
    	let hoverFill = "#d3d3d3";

    	const updateFillColor = (index, color) => {
    		$$invalidate(3, arcs = arcs.map((arc, i) => i === index ? { ...arc, fill: color } : arc));
    	};

    	$$self.$$.on_mount.push(function () {
    		if (cx === undefined && !('cx' in $$props || $$self.$$.bound[$$self.$$.props['cx']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'cx'");
    		}

    		if (cy === undefined && !('cy' in $$props || $$self.$$.bound[$$self.$$.props['cy']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'cy'");
    		}

    		if (parts === undefined && !('parts' in $$props || $$self.$$.bound[$$self.$$.props['parts']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'parts'");
    		}

    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'name'");
    		}
    	});

    	const writable_props = ['cx', 'cy', 'parts', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OnePresidentUnit> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = i => updateFillColor(i, hoverFill);
    	const mouseout_handler = i => updateFillColor(i, defaultFill);
    	const focus_handler = i => updateFillColor(i, hoverFill);
    	const blur_handler = i => updateFillColor(i, defaultFill);

    	$$self.$$set = $$props => {
    		if ('cx' in $$props) $$invalidate(0, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(1, cy = $$props.cy);
    		if ('parts' in $$props) $$invalidate(12, parts = $$props.parts);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		cx,
    		cy,
    		parts,
    		name,
    		innerRadius,
    		outerRadius,
    		fill,
    		stroke,
    		strokeWidth,
    		defaultStrokeWidth,
    		defaultFill,
    		hoverFill,
    		updateFillColor,
    		arcs,
    		lineCoords
    	});

    	$$self.$inject_state = $$props => {
    		if ('cx' in $$props) $$invalidate(0, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(1, cy = $$props.cy);
    		if ('parts' in $$props) $$invalidate(12, parts = $$props.parts);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('innerRadius' in $$props) $$invalidate(5, innerRadius = $$props.innerRadius);
    		if ('outerRadius' in $$props) $$invalidate(17, outerRadius = $$props.outerRadius);
    		if ('fill' in $$props) $$invalidate(6, fill = $$props.fill);
    		if ('stroke' in $$props) $$invalidate(7, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(8, strokeWidth = $$props.strokeWidth);
    		if ('defaultStrokeWidth' in $$props) $$invalidate(18, defaultStrokeWidth = $$props.defaultStrokeWidth);
    		if ('defaultFill' in $$props) $$invalidate(9, defaultFill = $$props.defaultFill);
    		if ('hoverFill' in $$props) $$invalidate(10, hoverFill = $$props.hoverFill);
    		if ('arcs' in $$props) $$invalidate(3, arcs = $$props.arcs);
    		if ('lineCoords' in $$props) $$invalidate(4, lineCoords = $$props.lineCoords);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cx, cy*/ 3) {
    			$$invalidate(4, lineCoords = {
    				x1: cx - outerRadius,
    				x2: cx + outerRadius,
    				y1: cy + outerRadius + 30,
    				y2: cy + outerRadius + 30
    			});
    		}

    		if ($$self.$$.dirty & /*parts, cx, cy*/ 4099) {
    			$$invalidate(3, arcs = Array.from({ length: parts }, (_, i) => {
    				const angle = 2 * Math.PI / parts;
    				const startX = cx + outerRadius * Math.cos(i * angle);
    				const startY = cy + outerRadius * Math.sin(i * angle);
    				const endX = cx + outerRadius * Math.cos((i + 1) * angle);
    				const endY = cy + outerRadius * Math.sin((i + 1) * angle);

    				return {
    					d: `M ${cx} ${cy} L ${startX} ${startY} A ${outerRadius} ${outerRadius} 0 0 1 ${endX} ${endY} Z`,
    					strokeWidth: defaultStrokeWidth,
    					fill: defaultFill
    				};
    			}));
    		}
    	};

    	return [
    		cx,
    		cy,
    		name,
    		arcs,
    		lineCoords,
    		innerRadius,
    		fill,
    		stroke,
    		strokeWidth,
    		defaultFill,
    		hoverFill,
    		updateFillColor,
    		parts,
    		mouseover_handler,
    		mouseout_handler,
    		focus_handler,
    		blur_handler
    	];
    }

    class OnePresidentUnit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { cx: 0, cy: 1, parts: 12, name: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OnePresidentUnit",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get cx() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cx(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cy() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cy(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parts() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parts(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let svgWidth = writable(window.innerWidth / 2);

    const presidents = writable([]);

    const updatePresidents = () => {
      presidents.set([
        {
          cx: get_store_value(svgWidth) / 4,
          cy: 200,
          parts: 6,
          name: "name1",
        },
        {
          cx: get_store_value(svgWidth) / 2,
          cy: 200,
          parts: 10,
          name: "name2",
        },
        {
          cx: (get_store_value(svgWidth) * 3) / 4,
          cy: 200,
          parts: 12,
          name: "name3",
        },
        {
          cx: get_store_value(svgWidth) / 4,
          cy: 500,
          parts: 6,
          name: "name4",
        },
      ]);
    };

    /* src/components/Svg.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/components/Svg.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:2) {#each $presidents as circle}
    function create_each_block(ctx) {
    	let circles;
    	let current;

    	circles = new OnePresidentUnit({
    			props: {
    				cx: /*circle*/ ctx[4].cx,
    				cy: /*circle*/ ctx[4].cy,
    				parts: /*circle*/ ctx[4].parts,
    				name: /*circle*/ ctx[4].name
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(circles.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circles, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const circles_changes = {};
    			if (dirty & /*$presidents*/ 4) circles_changes.cx = /*circle*/ ctx[4].cx;
    			if (dirty & /*$presidents*/ 4) circles_changes.cy = /*circle*/ ctx[4].cy;
    			if (dirty & /*$presidents*/ 4) circles_changes.parts = /*circle*/ ctx[4].parts;
    			if (dirty & /*$presidents*/ 4) circles_changes.name = /*circle*/ ctx[4].name;
    			circles.$set(circles_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circles.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circles.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circles, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:2) {#each $presidents as circle}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let svg;
    	let rect;
    	let current;
    	let each_value = /*$presidents*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			rect = svg_element("rect");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect, "width", /*$svgWidth*/ ctx[1]);
    			attr_dev(rect, "height", /*height*/ ctx[0]);
    			attr_dev(rect, "stroke", "black");
    			attr_dev(rect, "stroke-width", "3px");
    			attr_dev(rect, "fill", "none");
    			add_location(rect, file$1, 22, 2, 617);
    			attr_dev(svg, "width", /*$svgWidth*/ ctx[1]);
    			attr_dev(svg, "height", /*height*/ ctx[0]);
    			add_location(svg, file$1, 21, 0, 582);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, rect);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(svg, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$svgWidth*/ 2) {
    				attr_dev(rect, "width", /*$svgWidth*/ ctx[1]);
    			}

    			if (!current || dirty & /*height*/ 1) {
    				attr_dev(rect, "height", /*height*/ ctx[0]);
    			}

    			if (dirty & /*$presidents*/ 4) {
    				each_value = /*$presidents*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(svg, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*$svgWidth*/ 2) {
    				attr_dev(svg, "width", /*$svgWidth*/ ctx[1]);
    			}

    			if (!current || dirty & /*height*/ 1) {
    				attr_dev(svg, "height", /*height*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $svgWidth;
    	let $presidents;
    	validate_store(svgWidth, 'svgWidth');
    	component_subscribe($$self, svgWidth, $$value => $$invalidate(1, $svgWidth = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(2, $presidents = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svg', slots, []);
    	let height = window.innerHeight;

    	const updateDimensions = () => {
    		svgWidth.set(window.innerWidth / 2);
    		$$invalidate(0, height = window.innerHeight);
    		updatePresidents();
    	};

    	onMount(() => {
    		updatePresidents();
    		window.addEventListener("resize", updateDimensions);
    		return () => window.removeEventListener("resize", updateDimensions);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Circles: OnePresidentUnit,
    		svgWidth,
    		presidents,
    		updatePresidents,
    		height,
    		updateDimensions,
    		$svgWidth,
    		$presidents
    	});

    	$$self.$inject_state = $$props => {
    		if ('height' in $$props) $$invalidate(0, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [height, $svgWidth, $presidents];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let svg;
    	let current;
    	svg = new Svg({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(svg.$$.fragment);
    			attr_dev(main, "class", "svelte-177t831");
    			add_location(main, file, 4, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(svg, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svg.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svg.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Svg });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
