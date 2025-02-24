
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
    function empty() {
        return text('');
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

    const svgWidth = writable(30);
    const svgHeight = writable(30);
    const maxCirclesPerRow = writable(1);
    const totalRows = writable(1);
    const innerRadius = writable(70);
    const outerRadius = writable(100);
    const circleSpacing = writable(100);
    const rowSpacing = writable(200);
    const titleSpace = writable(300);

    const presidents = writable([
      {
        name: "George Washington",
        status: "dead",
        birthYear: 1732,
        birthPlace: "Westmoreland County, Virginia",
        parents: "Augustine Washington and Mary Ball Washington",
        deathYear: 1799,
        deathPlace: "Mount Vernon, Virginia",
        deathReason: "Epiglottitis or pneumonia",
        presidencyStart: 1789,
        presidencyEnd: 1797,
        keyPolicies: 6,
      },
      {
        name: "John Adams",
        status: "dead",
        birthYear: 1735,
        birthPlace: "Braintree, Massachusetts",
        parents: "John Adams Sr. and Susanna Boylston",
        deathYear: 1826,
        deathPlace: "Quincy, Massachusetts",
        deathReason: "Heart failure and natural causes",
        presidencyStart: 1797,
        presidencyEnd: 1801,
        keyPolicies: 16,
      },
      {
        name: "Thomas Jefferson",
        status: "dead",
        birthYear: 1743,
        birthPlace: "Shadwell, Virginia",
        parents: "Peter Jefferson and Jane Randolph",
        deathYear: 1826,
        deathPlace: "Monticello, Virginia",
        deathReason: "Kidney infection and natural causes",
        presidencyStart: 1801,
        presidencyEnd: 1809,
        keyPolicies: 12,
      },
      {
        name: "James Madison",
        status: "dead",
        birthYear: 1751,
        birthPlace: "Port Conway, Virginia",
        parents: "James Madison Sr. and Nelly Conway Madison",
        deathYear: 1836,
        deathPlace: "Montpelier, Virginia",
        deathReason: "Heart failure and natural causes",
        presidencyStart: 1809,
        presidencyEnd: 1817,
        keyPolicies: 8,
      },
    ]);

    /* src/components/onePresidentUnit.svelte generated by Svelte v3.59.2 */
    const file$2 = "src/components/onePresidentUnit.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    // (30:2) {#each Array($presidents[index].keyPolicies).fill(0) as _, arcIndex}
    function create_each_block$1(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;
    	let mounted;
    	let dispose;

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[12](/*arcIndex*/ ctx[26]);
    	}

    	function focus_handler() {
    		return /*focus_handler*/ ctx[14](/*arcIndex*/ ctx[26]);
    	}

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = calculateArcPath(/*cx*/ ctx[2], /*cy*/ ctx[3], /*outerRadius*/ ctx[5], /*arcIndex*/ ctx[26], /*$presidents*/ ctx[11][/*index*/ ctx[9]].keyPolicies));

    			attr_dev(path, "fill", path_fill_value = /*hoveredArc*/ ctx[10] === `${/*index*/ ctx[9]}-${/*arcIndex*/ ctx[26]}`
    			? "lightblue"
    			: "transparent");

    			attr_dev(path, "stroke", "black");
    			attr_dev(path, "stroke-width", "2px");
    			add_location(path, file$2, 31, 4, 1005);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(path, "mouseover", mouseover_handler, false, false, false, false),
    					listen_dev(path, "mouseout", /*mouseout_handler*/ ctx[13], false, false, false, false),
    					listen_dev(path, "focus", focus_handler, false, false, false, false),
    					listen_dev(path, "blur", /*blur_handler*/ ctx[15], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*cx, cy, outerRadius, $presidents, index*/ 2604 && path_d_value !== (path_d_value = calculateArcPath(/*cx*/ ctx[2], /*cy*/ ctx[3], /*outerRadius*/ ctx[5], /*arcIndex*/ ctx[26], /*$presidents*/ ctx[11][/*index*/ ctx[9]].keyPolicies))) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*hoveredArc, index*/ 1536 && path_fill_value !== (path_fill_value = /*hoveredArc*/ ctx[10] === `${/*index*/ ctx[9]}-${/*arcIndex*/ ctx[26]}`
    			? "lightblue"
    			: "transparent")) {
    				attr_dev(path, "fill", path_fill_value);
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
    		source: "(30:2) {#each Array($presidents[index].keyPolicies).fill(0) as _, arcIndex}",
    		ctx
    	});

    	return block;
    }

    // (81:2) {#if hoveredBirthIndex === index}
    function create_if_block_2(ctx) {
    	let text_1;
    	let tspan0;
    	let t0;
    	let t1_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].parents + "";
    	let t1;
    	let tspan0_x_value;
    	let t2;
    	let tspan1;
    	let t3;
    	let t4_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthPlace + "";
    	let t4;
    	let tspan1_x_value;
    	let t5;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			tspan0 = svg_element("tspan");
    			t0 = text("Born to ");
    			t1 = text(t1_value);
    			t2 = space();
    			tspan1 = svg_element("tspan");
    			t3 = text("at ");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(tspan0, "x", tspan0_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(tspan0, "dy", "0");
    			add_location(tspan0, file$2, 88, 6, 2397);
    			attr_dev(tspan1, "x", tspan1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(tspan1, "dy", "15");
    			add_location(tspan1, file$2, 91, 6, 2499);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "12px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$2, 81, 4, 2245);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, tspan0);
    			append_dev(tspan0, t0);
    			append_dev(tspan0, t1);
    			append_dev(text_1, t2);
    			append_dev(text_1, tspan1);
    			append_dev(tspan1, t3);
    			append_dev(tspan1, t4);
    			append_dev(text_1, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presidents, index*/ 2560 && t1_value !== (t1_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].parents + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*cx, outerRadius*/ 36 && tspan0_x_value !== (tspan0_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan0, "x", tspan0_x_value);
    			}

    			if (dirty & /*$presidents, index*/ 2560 && t4_value !== (t4_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthPlace + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*cx, outerRadius*/ 36 && tspan1_x_value !== (tspan1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan1, "x", tspan1_x_value);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(81:2) {#if hoveredBirthIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (138:2) {:else}
    function create_else_block(ctx) {
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", line_x__value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(line, "y1", line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.45);
    			attr_dev(line, "x2", line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(line, "y2", line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.55);
    			attr_dev(line, "stroke", "black");
    			attr_dev(line, "stroke-width", "3px");
    			add_location(line, file$2, 138, 4, 3770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cx, outerRadius*/ 36 && line_x__value !== (line_x__value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && line_y__value !== (line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.45)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && line_x__value_1 !== (line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && line_y__value_1 !== (line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.55)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(138:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (99:2) {#if $presidents[index].status === "dead"}
    function create_if_block(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let text_1;
    	let t_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].deathYear + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;
    	let mounted;
    	let dispose;
    	let if_block = /*hoveredDeathIndex*/ ctx[1] === /*index*/ ctx[9] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			if (if_block) if_block.c();
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(circle, "cx", circle_cx_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(circle, "cy", circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle, "r", "4");
    			attr_dev(circle, "fill", "black");
    			add_location(circle, file$2, 99, 4, 2720);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5] + 10);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5);
    			attr_dev(text_1, "text-anchor", "start");
    			attr_dev(text_1, "font-size", "0.9rem");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$2, 128, 4, 3556);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "mouseover", /*mouseover_handler_2*/ ctx[20], false, false, false, false),
    					listen_dev(circle, "mouseout", /*mouseout_handler_2*/ ctx[21], false, false, false, false),
    					listen_dev(circle, "focus", /*focus_handler_2*/ ctx[22], false, false, false, false),
    					listen_dev(circle, "blur", /*blur_handler_2*/ ctx[23], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cx, outerRadius*/ 36 && circle_cx_value !== (circle_cx_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && circle_cy_value !== (circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (/*hoveredDeathIndex*/ ctx[1] === /*index*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(text_1.parentNode, text_1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$presidents, index*/ 2560 && t_value !== (t_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].deathYear + "")) set_data_dev(t, t_value);

    			if (dirty & /*cx, outerRadius*/ 36 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5] + 10)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(text_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(99:2) {#if $presidents[index].status === \\\"dead\\\"}",
    		ctx
    	});

    	return block;
    }

    // (112:4) {#if hoveredDeathIndex === index}
    function create_if_block_1(ctx) {
    	let text_1;
    	let tspan0;
    	let t0;
    	let t1_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].deathPlace + "";
    	let t1;
    	let tspan0_x_value;
    	let t2;
    	let tspan1;
    	let t3;
    	let t4_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].deathReason + "";
    	let t4;
    	let tspan1_x_value;
    	let t5;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			tspan0 = svg_element("tspan");
    			t0 = text("Died at ");
    			t1 = text(t1_value);
    			t2 = space();
    			tspan1 = svg_element("tspan");
    			t3 = text("for ");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(tspan0, "x", tspan0_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(tspan0, "dy", "0");
    			add_location(tspan0, file$2, 119, 8, 3315);
    			attr_dev(tspan1, "x", tspan1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(tspan1, "dy", "15");
    			add_location(tspan1, file$2, 122, 8, 3426);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "12px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$2, 112, 6, 3149);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, tspan0);
    			append_dev(tspan0, t0);
    			append_dev(tspan0, t1);
    			append_dev(text_1, t2);
    			append_dev(text_1, tspan1);
    			append_dev(tspan1, t3);
    			append_dev(tspan1, t4);
    			append_dev(text_1, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presidents, index*/ 2560 && t1_value !== (t1_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].deathPlace + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*cx, outerRadius*/ 36 && tspan0_x_value !== (tspan0_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan0, "x", tspan0_x_value);
    			}

    			if (dirty & /*$presidents, index*/ 2560 && t4_value !== (t4_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].deathReason + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*cx, outerRadius*/ 36 && tspan1_x_value !== (tspan1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan1, "x", tspan1_x_value);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(112:4) {#if hoveredDeathIndex === index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let g;
    	let circle0;
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;
    	let circle1;
    	let circle1_cx_value;
    	let circle1_cy_value;
    	let if_block0_anchor;
    	let text0;
    	let t0_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].name + "";
    	let t0;
    	let text0_y_value;
    	let text1;
    	let t1_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].presidencyStart + "";
    	let t1;
    	let t2;
    	let t3_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].presidencyEnd + "";
    	let t3;
    	let text1_y_value;
    	let text2;
    	let t4_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthYear + "";
    	let t4;
    	let text2_x_value;
    	let text2_y_value;
    	let circle2;
    	let circle2_cx_value;
    	let circle2_cy_value;
    	let circle3;
    	let circle3_cx_value;
    	let circle3_cy_value;
    	let mounted;
    	let dispose;
    	let each_value = Array(/*$presidents*/ ctx[11][/*index*/ ctx[9]].keyPolicies).fill(0);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block0 = /*hoveredBirthIndex*/ ctx[0] === /*index*/ ctx[9] && create_if_block_2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$presidents*/ ctx[11][/*index*/ ctx[9]].status === "dead") return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			circle0 = svg_element("circle");
    			line = svg_element("line");
    			circle1 = svg_element("circle");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if_block1.c();
    			text0 = svg_element("text");
    			t0 = text(t0_value);
    			text1 = svg_element("text");
    			t1 = text(t1_value);
    			t2 = text(" - ");
    			t3 = text(t3_value);
    			text2 = svg_element("text");
    			t4 = text(t4_value);
    			circle2 = svg_element("circle");
    			circle3 = svg_element("circle");
    			attr_dev(circle0, "cx", /*cx*/ ctx[2]);
    			attr_dev(circle0, "cy", /*cy*/ ctx[3]);
    			attr_dev(circle0, "r", /*innerRadius*/ ctx[4]);
    			attr_dev(circle0, "stroke", /*stroke*/ ctx[6]);
    			attr_dev(circle0, "stroke-width", /*strokeWidth*/ ctx[7]);
    			attr_dev(circle0, "fill", /*fill*/ ctx[8]);
    			add_location(circle0, file$2, 49, 2, 1544);
    			attr_dev(line, "x1", line_x__value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(line, "y1", line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(line, "x2", line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(line, "y2", line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(line, "stroke", /*stroke*/ ctx[6]);
    			attr_dev(line, "stroke-width", /*strokeWidth*/ ctx[7]);
    			add_location(line, file$2, 58, 2, 1653);
    			attr_dev(circle1, "cx", circle1_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(circle1, "cy", circle1_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle1, "r", "4");
    			attr_dev(circle1, "fill", "black");
    			add_location(circle1, file$2, 68, 2, 1863);
    			attr_dev(text0, "x", /*cx*/ ctx[2]);
    			attr_dev(text0, "y", text0_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 20);
    			attr_dev(text0, "text-anchor", "middle");
    			attr_dev(text0, "font-size", "16px");
    			attr_dev(text0, "fill", "black");
    			add_location(text0, file$2, 149, 2, 3993);
    			attr_dev(text1, "x", /*cx*/ ctx[2]);
    			attr_dev(text1, "y", text1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 5);
    			attr_dev(text1, "text-anchor", "middle");
    			attr_dev(text1, "font-size", "14px");
    			attr_dev(text1, "fill", "black");
    			add_location(text1, file$2, 160, 2, 4193);
    			attr_dev(text2, "x", text2_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] - 10);
    			attr_dev(text2, "y", text2_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5);
    			attr_dev(text2, "text-anchor", "end");
    			attr_dev(text2, "font-size", "0.9rem");
    			attr_dev(text2, "fill", "black");
    			add_location(text2, file$2, 171, 2, 4436);
    			attr_dev(circle2, "cx", circle2_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[11][/*index*/ ctx[9]].presidencyStart - /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthYear) / (/*$presidents*/ ctx[11][/*index*/ ctx[9]].deathYear - /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]));
    			attr_dev(circle2, "cy", circle2_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle2, "r", "4");
    			attr_dev(circle2, "fill", "teal");
    			add_location(circle2, file$2, 182, 2, 4656);
    			attr_dev(circle3, "cx", circle3_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[11][/*index*/ ctx[9]].presidencyEnd - /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthYear) / (/*$presidents*/ ctx[11][/*index*/ ctx[9]].deathYear - /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]));
    			attr_dev(circle3, "cy", circle3_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle3, "r", "4");
    			attr_dev(circle3, "fill", "teal");
    			add_location(circle3, file$2, 194, 2, 4973);
    			add_location(g, file$2, 28, 0, 885);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(g, null);
    				}
    			}

    			append_dev(g, circle0);
    			append_dev(g, line);
    			append_dev(g, circle1);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if_block1.m(g, null);
    			append_dev(g, text0);
    			append_dev(text0, t0);
    			append_dev(g, text1);
    			append_dev(text1, t1);
    			append_dev(text1, t2);
    			append_dev(text1, t3);
    			append_dev(g, text2);
    			append_dev(text2, t4);
    			append_dev(g, circle2);
    			append_dev(g, circle3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle1, "mouseover", /*mouseover_handler_1*/ ctx[16], false, false, false, false),
    					listen_dev(circle1, "mouseout", /*mouseout_handler_1*/ ctx[17], false, false, false, false),
    					listen_dev(circle1, "focus", /*focus_handler_1*/ ctx[18], false, false, false, false),
    					listen_dev(circle1, "blur", /*blur_handler_1*/ ctx[19], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*calculateArcPath, cx, cy, outerRadius, $presidents, index, hoveredArc*/ 3628) {
    				each_value = Array(/*$presidents*/ ctx[11][/*index*/ ctx[9]].keyPolicies).fill(0);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, circle0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*cx*/ 4) {
    				attr_dev(circle0, "cx", /*cx*/ ctx[2]);
    			}

    			if (dirty & /*cy*/ 8) {
    				attr_dev(circle0, "cy", /*cy*/ ctx[3]);
    			}

    			if (dirty & /*innerRadius*/ 16) {
    				attr_dev(circle0, "r", /*innerRadius*/ ctx[4]);
    			}

    			if (dirty & /*stroke*/ 64) {
    				attr_dev(circle0, "stroke", /*stroke*/ ctx[6]);
    			}

    			if (dirty & /*strokeWidth*/ 128) {
    				attr_dev(circle0, "stroke-width", /*strokeWidth*/ ctx[7]);
    			}

    			if (dirty & /*fill*/ 256) {
    				attr_dev(circle0, "fill", /*fill*/ ctx[8]);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && line_x__value !== (line_x__value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && line_y__value !== (line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && line_x__value_1 !== (line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && line_y__value_1 !== (line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*stroke*/ 64) {
    				attr_dev(line, "stroke", /*stroke*/ ctx[6]);
    			}

    			if (dirty & /*strokeWidth*/ 128) {
    				attr_dev(line, "stroke-width", /*strokeWidth*/ ctx[7]);
    			}

    			if (dirty & /*cx, outerRadius*/ 36 && circle1_cx_value !== (circle1_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(circle1, "cx", circle1_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && circle1_cy_value !== (circle1_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle1, "cy", circle1_cy_value);
    			}

    			if (/*hoveredBirthIndex*/ ctx[0] === /*index*/ ctx[9]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(g, text0);
    				}
    			}

    			if (dirty & /*$presidents, index*/ 2560 && t0_value !== (t0_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*cx*/ 4) {
    				attr_dev(text0, "x", /*cx*/ ctx[2]);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text0_y_value !== (text0_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 20)) {
    				attr_dev(text0, "y", text0_y_value);
    			}

    			if (dirty & /*$presidents, index*/ 2560 && t1_value !== (t1_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].presidencyStart + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$presidents, index*/ 2560 && t3_value !== (t3_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].presidencyEnd + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*cx*/ 4) {
    				attr_dev(text1, "x", /*cx*/ ctx[2]);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text1_y_value !== (text1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 5)) {
    				attr_dev(text1, "y", text1_y_value);
    			}

    			if (dirty & /*$presidents, index*/ 2560 && t4_value !== (t4_value = /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthYear + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*cx, outerRadius*/ 36 && text2_x_value !== (text2_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] - 10)) {
    				attr_dev(text2, "x", text2_x_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && text2_y_value !== (text2_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5)) {
    				attr_dev(text2, "y", text2_y_value);
    			}

    			if (dirty & /*cx, outerRadius, $presidents, index*/ 2596 && circle2_cx_value !== (circle2_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[11][/*index*/ ctx[9]].presidencyStart - /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthYear) / (/*$presidents*/ ctx[11][/*index*/ ctx[9]].deathYear - /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]))) {
    				attr_dev(circle2, "cx", circle2_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && circle2_cy_value !== (circle2_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle2, "cy", circle2_cy_value);
    			}

    			if (dirty & /*cx, outerRadius, $presidents, index*/ 2596 && circle3_cx_value !== (circle3_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[11][/*index*/ ctx[9]].presidencyEnd - /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthYear) / (/*$presidents*/ ctx[11][/*index*/ ctx[9]].deathYear - /*$presidents*/ ctx[11][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]))) {
    				attr_dev(circle3, "cx", circle3_cx_value);
    			}

    			if (dirty & /*cy, outerRadius*/ 40 && circle3_cy_value !== (circle3_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle3, "cy", circle3_cy_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			mounted = false;
    			run_all(dispose);
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

    function calculateArcPath(cx, cy, radius, arcIndex, totalArcs) {
    	const anglePerArc = 2 * Math.PI / totalArcs;
    	const startAngle = arcIndex * anglePerArc;
    	const endAngle = (arcIndex + 1) * anglePerArc;
    	const x1 = cx + radius * Math.cos(startAngle);
    	const y1 = cy + radius * Math.sin(startAngle);
    	const x2 = cx + radius * Math.cos(endAngle);
    	const y2 = cy + radius * Math.sin(endAngle);
    	return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $presidents;
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(11, $presidents = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OnePresidentUnit', slots, []);
    	let { cx } = $$props;
    	let { cy } = $$props;
    	let { innerRadius } = $$props;
    	let { outerRadius } = $$props;
    	let { stroke = "black" } = $$props;
    	let { strokeWidth = "3px" } = $$props;
    	let { fill = "white" } = $$props;
    	let { index } = $$props;
    	let { hoveredBirthIndex = null } = $$props;
    	let { hoveredDeathIndex = null } = $$props;
    	let hoveredArc = null;

    	$$self.$$.on_mount.push(function () {
    		if (cx === undefined && !('cx' in $$props || $$self.$$.bound[$$self.$$.props['cx']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'cx'");
    		}

    		if (cy === undefined && !('cy' in $$props || $$self.$$.bound[$$self.$$.props['cy']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'cy'");
    		}

    		if (innerRadius === undefined && !('innerRadius' in $$props || $$self.$$.bound[$$self.$$.props['innerRadius']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'innerRadius'");
    		}

    		if (outerRadius === undefined && !('outerRadius' in $$props || $$self.$$.bound[$$self.$$.props['outerRadius']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'outerRadius'");
    		}

    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<OnePresidentUnit> was created without expected prop 'index'");
    		}
    	});

    	const writable_props = [
    		'cx',
    		'cy',
    		'innerRadius',
    		'outerRadius',
    		'stroke',
    		'strokeWidth',
    		'fill',
    		'index',
    		'hoveredBirthIndex',
    		'hoveredDeathIndex'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OnePresidentUnit> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = arcIndex => $$invalidate(10, hoveredArc = `${index}-${arcIndex}`);
    	const mouseout_handler = () => $$invalidate(10, hoveredArc = null);
    	const focus_handler = arcIndex => $$invalidate(10, hoveredArc = `${index}-${arcIndex}`);
    	const blur_handler = () => $$invalidate(10, hoveredArc = null);
    	const mouseover_handler_1 = () => $$invalidate(0, hoveredBirthIndex = index);
    	const mouseout_handler_1 = () => $$invalidate(0, hoveredBirthIndex = null);
    	const focus_handler_1 = () => $$invalidate(0, hoveredBirthIndex = index);
    	const blur_handler_1 = () => $$invalidate(0, hoveredBirthIndex = null);
    	const mouseover_handler_2 = () => $$invalidate(1, hoveredDeathIndex = index);
    	const mouseout_handler_2 = () => $$invalidate(1, hoveredDeathIndex = null);
    	const focus_handler_2 = () => $$invalidate(1, hoveredDeathIndex = index);
    	const blur_handler_2 = () => $$invalidate(1, hoveredDeathIndex = null);

    	$$self.$$set = $$props => {
    		if ('cx' in $$props) $$invalidate(2, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(3, cy = $$props.cy);
    		if ('innerRadius' in $$props) $$invalidate(4, innerRadius = $$props.innerRadius);
    		if ('outerRadius' in $$props) $$invalidate(5, outerRadius = $$props.outerRadius);
    		if ('stroke' in $$props) $$invalidate(6, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(7, strokeWidth = $$props.strokeWidth);
    		if ('fill' in $$props) $$invalidate(8, fill = $$props.fill);
    		if ('index' in $$props) $$invalidate(9, index = $$props.index);
    		if ('hoveredBirthIndex' in $$props) $$invalidate(0, hoveredBirthIndex = $$props.hoveredBirthIndex);
    		if ('hoveredDeathIndex' in $$props) $$invalidate(1, hoveredDeathIndex = $$props.hoveredDeathIndex);
    	};

    	$$self.$capture_state = () => ({
    		presidents,
    		cx,
    		cy,
    		innerRadius,
    		outerRadius,
    		stroke,
    		strokeWidth,
    		fill,
    		index,
    		hoveredBirthIndex,
    		hoveredDeathIndex,
    		hoveredArc,
    		calculateArcPath,
    		$presidents
    	});

    	$$self.$inject_state = $$props => {
    		if ('cx' in $$props) $$invalidate(2, cx = $$props.cx);
    		if ('cy' in $$props) $$invalidate(3, cy = $$props.cy);
    		if ('innerRadius' in $$props) $$invalidate(4, innerRadius = $$props.innerRadius);
    		if ('outerRadius' in $$props) $$invalidate(5, outerRadius = $$props.outerRadius);
    		if ('stroke' in $$props) $$invalidate(6, stroke = $$props.stroke);
    		if ('strokeWidth' in $$props) $$invalidate(7, strokeWidth = $$props.strokeWidth);
    		if ('fill' in $$props) $$invalidate(8, fill = $$props.fill);
    		if ('index' in $$props) $$invalidate(9, index = $$props.index);
    		if ('hoveredBirthIndex' in $$props) $$invalidate(0, hoveredBirthIndex = $$props.hoveredBirthIndex);
    		if ('hoveredDeathIndex' in $$props) $$invalidate(1, hoveredDeathIndex = $$props.hoveredDeathIndex);
    		if ('hoveredArc' in $$props) $$invalidate(10, hoveredArc = $$props.hoveredArc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hoveredBirthIndex,
    		hoveredDeathIndex,
    		cx,
    		cy,
    		innerRadius,
    		outerRadius,
    		stroke,
    		strokeWidth,
    		fill,
    		index,
    		hoveredArc,
    		$presidents,
    		mouseover_handler,
    		mouseout_handler,
    		focus_handler,
    		blur_handler,
    		mouseover_handler_1,
    		mouseout_handler_1,
    		focus_handler_1,
    		blur_handler_1,
    		mouseover_handler_2,
    		mouseout_handler_2,
    		focus_handler_2,
    		blur_handler_2
    	];
    }

    class OnePresidentUnit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			cx: 2,
    			cy: 3,
    			innerRadius: 4,
    			outerRadius: 5,
    			stroke: 6,
    			strokeWidth: 7,
    			fill: 8,
    			index: 9,
    			hoveredBirthIndex: 0,
    			hoveredDeathIndex: 1
    		});

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

    	get innerRadius() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set innerRadius(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outerRadius() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outerRadius(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stroke() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stroke(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get strokeWidth() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set strokeWidth(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fill() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoveredBirthIndex() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoveredBirthIndex(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoveredDeathIndex() {
    		throw new Error("<OnePresidentUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoveredDeathIndex(value) {
    		throw new Error("<OnePresidentUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Svg.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/components/Svg.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (86:2) {#each positions as position, index}
    function create_each_block(ctx) {
    	let onepresidentunit;
    	let current;

    	onepresidentunit = new OnePresidentUnit({
    			props: {
    				cx: /*position*/ ctx[12].cx,
    				cy: /*position*/ ctx[12].cy,
    				innerRadius: /*$innerRadius*/ ctx[4],
    				outerRadius: /*$outerRadius*/ ctx[0],
    				index: /*index*/ ctx[14]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(onepresidentunit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(onepresidentunit, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const onepresidentunit_changes = {};
    			if (dirty & /*positions*/ 4) onepresidentunit_changes.cx = /*position*/ ctx[12].cx;
    			if (dirty & /*positions*/ 4) onepresidentunit_changes.cy = /*position*/ ctx[12].cy;
    			if (dirty & /*$innerRadius*/ 16) onepresidentunit_changes.innerRadius = /*$innerRadius*/ ctx[4];
    			if (dirty & /*$outerRadius*/ 1) onepresidentunit_changes.outerRadius = /*$outerRadius*/ ctx[0];
    			onepresidentunit.$set(onepresidentunit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(onepresidentunit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(onepresidentunit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(onepresidentunit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(86:2) {#each positions as position, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let svg;
    	let rect;
    	let current;
    	let each_value = /*positions*/ ctx[2];
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
    			attr_dev(rect, "height", /*$svgHeight*/ ctx[3]);
    			attr_dev(rect, "stroke", "black");
    			attr_dev(rect, "stroke-width", "3px");
    			attr_dev(rect, "fill", "none");
    			add_location(rect, file$1, 77, 2, 2018);
    			attr_dev(svg, "width", /*$svgWidth*/ ctx[1]);
    			attr_dev(svg, "height", /*$svgHeight*/ ctx[3]);
    			add_location(svg, file$1, 76, 0, 1972);
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

    			if (!current || dirty & /*$svgHeight*/ 8) {
    				attr_dev(rect, "height", /*$svgHeight*/ ctx[3]);
    			}

    			if (dirty & /*positions, $innerRadius, $outerRadius*/ 21) {
    				each_value = /*positions*/ ctx[2];
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

    			if (!current || dirty & /*$svgHeight*/ 8) {
    				attr_dev(svg, "height", /*$svgHeight*/ ctx[3]);
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
    	let $titleSpace;
    	let $outerRadius;
    	let $rowSpacing;
    	let $circleSpacing;
    	let $svgWidth;
    	let $maxCirclesPerRow;
    	let $presidents;
    	let $svgHeight;
    	let $innerRadius;
    	validate_store(titleSpace, 'titleSpace');
    	component_subscribe($$self, titleSpace, $$value => $$invalidate(5, $titleSpace = $$value));
    	validate_store(outerRadius, 'outerRadius');
    	component_subscribe($$self, outerRadius, $$value => $$invalidate(0, $outerRadius = $$value));
    	validate_store(rowSpacing, 'rowSpacing');
    	component_subscribe($$self, rowSpacing, $$value => $$invalidate(6, $rowSpacing = $$value));
    	validate_store(circleSpacing, 'circleSpacing');
    	component_subscribe($$self, circleSpacing, $$value => $$invalidate(7, $circleSpacing = $$value));
    	validate_store(svgWidth, 'svgWidth');
    	component_subscribe($$self, svgWidth, $$value => $$invalidate(1, $svgWidth = $$value));
    	validate_store(maxCirclesPerRow, 'maxCirclesPerRow');
    	component_subscribe($$self, maxCirclesPerRow, $$value => $$invalidate(8, $maxCirclesPerRow = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(9, $presidents = $$value));
    	validate_store(svgHeight, 'svgHeight');
    	component_subscribe($$self, svgHeight, $$value => $$invalidate(3, $svgHeight = $$value));
    	validate_store(innerRadius, 'innerRadius');
    	component_subscribe($$self, innerRadius, $$value => $$invalidate(4, $innerRadius = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svg', slots, []);
    	let positions = [];

    	function updateSvgWidth() {
    		let screenWidth = window.innerWidth;

    		if (screenWidth > 1024) {
    			maxCirclesPerRow.set(3);
    		} else if (screenWidth > 768) {
    			maxCirclesPerRow.set(2);
    		} else {
    			maxCirclesPerRow.set(1);
    		}

    		let totalCirclesWidth = $maxCirclesPerRow * (2 * $outerRadius);
    		let totalSpacing = ($maxCirclesPerRow + 1) * $circleSpacing;
    		svgWidth.set(totalCirclesWidth + totalSpacing);
    	}

    	function updateSvgHeight() {
    		let totalPresidents = get_store_value(presidents).length;
    		let rows = Math.ceil(totalPresidents / get_store_value(maxCirclesPerRow));
    		totalRows.set(rows);
    		let totalCirclesHeight = rows * (2 * $outerRadius);
    		let totalSpacing = rows * $rowSpacing;
    		svgHeight.set($titleSpace + totalCirclesHeight + totalSpacing);
    	}

    	onMount(() => {
    		updateSvgWidth();
    		updateSvgHeight();
    	});

    	window.addEventListener("resize", () => {
    		updateSvgWidth();
    		updateSvgHeight();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		svgWidth,
    		svgHeight,
    		outerRadius,
    		innerRadius,
    		maxCirclesPerRow,
    		circleSpacing,
    		rowSpacing,
    		titleSpace,
    		totalRows,
    		OnePresidentUnit,
    		presidents,
    		onMount,
    		get: get_store_value,
    		positions,
    		updateSvgWidth,
    		updateSvgHeight,
    		$titleSpace,
    		$outerRadius,
    		$rowSpacing,
    		$circleSpacing,
    		$svgWidth,
    		$maxCirclesPerRow,
    		$presidents,
    		$svgHeight,
    		$innerRadius
    	});

    	$$self.$inject_state = $$props => {
    		if ('positions' in $$props) $$invalidate(2, positions = $$props.positions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$presidents, $maxCirclesPerRow, $outerRadius, $circleSpacing, $svgWidth, $rowSpacing, $titleSpace*/ 995) {
    			$$invalidate(2, positions = $presidents.map((_, index) => {
    				let row = Math.floor(index / $maxCirclesPerRow);
    				let col = index % $maxCirclesPerRow;
    				let totalCirclesInRow = Math.min($maxCirclesPerRow, $presidents.length - row * $maxCirclesPerRow);
    				let rowWidth = totalCirclesInRow * ($outerRadius * 2 + $circleSpacing) - $circleSpacing;
    				let colOffset = ($svgWidth - rowWidth) / 2;

    				return {
    					cx: col * ($outerRadius * 2 + $circleSpacing) + $outerRadius + colOffset,
    					cy: row * ($outerRadius * 2 + $rowSpacing) + $outerRadius + $titleSpace
    				};
    			}));
    		}
    	};

    	return [
    		$outerRadius,
    		$svgWidth,
    		positions,
    		$svgHeight,
    		$innerRadius,
    		$titleSpace,
    		$rowSpacing,
    		$circleSpacing,
    		$maxCirclesPerRow,
    		$presidents
    	];
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
