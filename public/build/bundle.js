
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
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

    const presidents = writable([
      {
        name: "George Washington",
        status: "dead",
        birthYear: 1732,
        deathYear: 1799,
        presidencyStart: 1789,
        presidencyEnd: 1797,
        parents: "Augustine Washington and Mary Ball Washington",
        keyPolicies: 6,
      },
      {
        name: "John Adams",
        status: "dead",
        birthYear: 1735,
        deathYear: 1826,
        presidencyStart: 1797,
        presidencyEnd: 1801,
        keyPolicies: 16,
      },
      {
        name: "Thomas Jefferson",
        status: "dead",
        birthYear: 1743,
        deathYear: 1826,
        presidencyStart: 1801,
        presidencyEnd: 1809,
        keyPolicies: 12,
      },
      {
        name: "James Madison",
        status: "dead",
        birthYear: 1751,
        deathYear: 1836,
        presidencyStart: 1809,
        presidencyEnd: 1817,
        keyPolicies: 8,
      },
    ]);

    const svgWidth = writable(30);
    const svgHeight = writable(30);
    const maxCirclesPerRow = writable(1);
    const totalRows = writable(1);
    const outerRadius = writable(100);
    const circleSpacing = writable(60);
    const rowSpacing = writable(200);
    const titleSpace = writable(200);

    /* src/components/setSvgWidthAndHeight.svelte generated by Svelte v3.59.2 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $titleSpace;
    	let $rowSpacing;
    	let $outerRadius;
    	let $circleSpacing;
    	let $maxCirclesPerRow;
    	validate_store(titleSpace, 'titleSpace');
    	component_subscribe($$self, titleSpace, $$value => $$invalidate(0, $titleSpace = $$value));
    	validate_store(rowSpacing, 'rowSpacing');
    	component_subscribe($$self, rowSpacing, $$value => $$invalidate(1, $rowSpacing = $$value));
    	validate_store(outerRadius, 'outerRadius');
    	component_subscribe($$self, outerRadius, $$value => $$invalidate(2, $outerRadius = $$value));
    	validate_store(circleSpacing, 'circleSpacing');
    	component_subscribe($$self, circleSpacing, $$value => $$invalidate(3, $circleSpacing = $$value));
    	validate_store(maxCirclesPerRow, 'maxCirclesPerRow');
    	component_subscribe($$self, maxCirclesPerRow, $$value => $$invalidate(4, $maxCirclesPerRow = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SetSvgWidthAndHeight', slots, []);

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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SetSvgWidthAndHeight> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		presidents,
    		svgWidth,
    		svgHeight,
    		maxCirclesPerRow,
    		totalRows,
    		outerRadius,
    		circleSpacing,
    		rowSpacing,
    		titleSpace,
    		onMount,
    		get: get_store_value,
    		updateSvgWidth,
    		updateSvgHeight,
    		$titleSpace,
    		$rowSpacing,
    		$outerRadius,
    		$circleSpacing,
    		$maxCirclesPerRow
    	});

    	return [];
    }

    class SetSvgWidthAndHeight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SetSvgWidthAndHeight",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/getCirclePositions.svelte generated by Svelte v3.59.2 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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
    	let $titleSpace;
    	let $outerRadius;
    	let $rowSpacing;
    	let $circleSpacing;
    	let $svgWidth;
    	let $maxCirclesPerRow;
    	let $presidents;
    	validate_store(titleSpace, 'titleSpace');
    	component_subscribe($$self, titleSpace, $$value => $$invalidate(1, $titleSpace = $$value));
    	validate_store(outerRadius, 'outerRadius');
    	component_subscribe($$self, outerRadius, $$value => $$invalidate(2, $outerRadius = $$value));
    	validate_store(rowSpacing, 'rowSpacing');
    	component_subscribe($$self, rowSpacing, $$value => $$invalidate(3, $rowSpacing = $$value));
    	validate_store(circleSpacing, 'circleSpacing');
    	component_subscribe($$self, circleSpacing, $$value => $$invalidate(4, $circleSpacing = $$value));
    	validate_store(svgWidth, 'svgWidth');
    	component_subscribe($$self, svgWidth, $$value => $$invalidate(5, $svgWidth = $$value));
    	validate_store(maxCirclesPerRow, 'maxCirclesPerRow');
    	component_subscribe($$self, maxCirclesPerRow, $$value => $$invalidate(6, $maxCirclesPerRow = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(7, $presidents = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GetCirclePositions', slots, []);
    	let { positions = [] } = $$props;
    	const writable_props = ['positions'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GetCirclePositions> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('positions' in $$props) $$invalidate(0, positions = $$props.positions);
    	};

    	$$self.$capture_state = () => ({
    		maxCirclesPerRow,
    		svgWidth,
    		outerRadius,
    		circleSpacing,
    		rowSpacing,
    		titleSpace,
    		presidents,
    		positions,
    		$titleSpace,
    		$outerRadius,
    		$rowSpacing,
    		$circleSpacing,
    		$svgWidth,
    		$maxCirclesPerRow,
    		$presidents
    	});

    	$$self.$inject_state = $$props => {
    		if ('positions' in $$props) $$invalidate(0, positions = $$props.positions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$presidents, $maxCirclesPerRow, $outerRadius, $circleSpacing, $svgWidth, $rowSpacing, $titleSpace*/ 254) {
    			$$invalidate(0, positions = $presidents.map((_, index) => {
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
    		positions,
    		$titleSpace,
    		$outerRadius,
    		$rowSpacing,
    		$circleSpacing,
    		$svgWidth,
    		$maxCirclesPerRow,
    		$presidents
    	];
    }

    class GetCirclePositions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { positions: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GetCirclePositions",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get positions() {
    		throw new Error("<GetCirclePositions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set positions(value) {
    		throw new Error("<GetCirclePositions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Svg.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/components/Svg.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (21:2) {#each positions as position, index}
    function create_each_block(ctx) {
    	let circle0;
    	let circle0_cx_value;
    	let circle0_cy_value;
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;
    	let circle1;
    	let circle1_cx_value;
    	let circle1_cy_value;
    	let text_1;
    	let t_value = /*$presidents*/ ctx[4][/*index*/ ctx[8]].name + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			circle0 = svg_element("circle");
    			line = svg_element("line");
    			circle1 = svg_element("circle");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(circle0, "cx", circle0_cx_value = /*position*/ ctx[6].cx);
    			attr_dev(circle0, "cy", circle0_cy_value = /*position*/ ctx[6].cy);
    			attr_dev(circle0, "r", /*$outerRadius*/ ctx[3]);
    			attr_dev(circle0, "stroke", "black");
    			attr_dev(circle0, "stroke-width", "3px");
    			attr_dev(circle0, "fill", "none");
    			add_location(circle0, file$1, 21, 4, 607);
    			attr_dev(line, "x1", line_x__value = /*position*/ ctx[6].cx - /*$outerRadius*/ ctx[3]);
    			attr_dev(line, "y1", line_y__value = /*position*/ ctx[6].cy + /*$outerRadius*/ ctx[3] * 1.5);
    			attr_dev(line, "x2", line_x__value_1 = /*position*/ ctx[6].cx + /*$outerRadius*/ ctx[3]);
    			attr_dev(line, "y2", line_y__value_1 = /*position*/ ctx[6].cy + /*$outerRadius*/ ctx[3] * 1.5);
    			attr_dev(line, "stroke", "black");
    			attr_dev(line, "stroke-width", "3px");
    			add_location(line, file$1, 29, 4, 759);
    			attr_dev(circle1, "cx", circle1_cx_value = /*position*/ ctx[6].cx - /*$outerRadius*/ ctx[3]);
    			attr_dev(circle1, "cy", circle1_cy_value = /*position*/ ctx[6].cy + /*$outerRadius*/ ctx[3] * 1.5);
    			attr_dev(circle1, "r", "4");
    			attr_dev(circle1, "fill", "black");
    			add_location(circle1, file$1, 38, 4, 987);
    			attr_dev(text_1, "x", text_1_x_value = /*position*/ ctx[6].cx);
    			attr_dev(text_1, "y", text_1_y_value = /*position*/ ctx[6].cy + /*$outerRadius*/ ctx[3] * 1.5 - 8);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "16px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$1, 45, 4, 1120);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle0, anchor);
    			insert_dev(target, line, anchor);
    			insert_dev(target, circle1, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*positions*/ 1 && circle0_cx_value !== (circle0_cx_value = /*position*/ ctx[6].cx)) {
    				attr_dev(circle0, "cx", circle0_cx_value);
    			}

    			if (dirty & /*positions*/ 1 && circle0_cy_value !== (circle0_cy_value = /*position*/ ctx[6].cy)) {
    				attr_dev(circle0, "cy", circle0_cy_value);
    			}

    			if (dirty & /*$outerRadius*/ 8) {
    				attr_dev(circle0, "r", /*$outerRadius*/ ctx[3]);
    			}

    			if (dirty & /*positions, $outerRadius*/ 9 && line_x__value !== (line_x__value = /*position*/ ctx[6].cx - /*$outerRadius*/ ctx[3])) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*positions, $outerRadius*/ 9 && line_y__value !== (line_y__value = /*position*/ ctx[6].cy + /*$outerRadius*/ ctx[3] * 1.5)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*positions, $outerRadius*/ 9 && line_x__value_1 !== (line_x__value_1 = /*position*/ ctx[6].cx + /*$outerRadius*/ ctx[3])) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*positions, $outerRadius*/ 9 && line_y__value_1 !== (line_y__value_1 = /*position*/ ctx[6].cy + /*$outerRadius*/ ctx[3] * 1.5)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*positions, $outerRadius*/ 9 && circle1_cx_value !== (circle1_cx_value = /*position*/ ctx[6].cx - /*$outerRadius*/ ctx[3])) {
    				attr_dev(circle1, "cx", circle1_cx_value);
    			}

    			if (dirty & /*positions, $outerRadius*/ 9 && circle1_cy_value !== (circle1_cy_value = /*position*/ ctx[6].cy + /*$outerRadius*/ ctx[3] * 1.5)) {
    				attr_dev(circle1, "cy", circle1_cy_value);
    			}

    			if (dirty & /*$presidents*/ 16 && t_value !== (t_value = /*$presidents*/ ctx[4][/*index*/ ctx[8]].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*positions*/ 1 && text_1_x_value !== (text_1_x_value = /*position*/ ctx[6].cx)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*positions, $outerRadius*/ 9 && text_1_y_value !== (text_1_y_value = /*position*/ ctx[6].cy + /*$outerRadius*/ ctx[3] * 1.5 - 8)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle0);
    			if (detaching) detach_dev(line);
    			if (detaching) detach_dev(circle1);
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(21:2) {#each positions as position, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let setsvgwidthandheight;
    	let t;
    	let svg;
    	let rect;
    	let getcirclepositions;
    	let updating_positions;
    	let current;
    	setsvgwidthandheight = new SetSvgWidthAndHeight({ $$inline: true });

    	function getcirclepositions_positions_binding(value) {
    		/*getcirclepositions_positions_binding*/ ctx[5](value);
    	}

    	let getcirclepositions_props = {};

    	if (/*positions*/ ctx[0] !== void 0) {
    		getcirclepositions_props.positions = /*positions*/ ctx[0];
    	}

    	getcirclepositions = new GetCirclePositions({
    			props: getcirclepositions_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(getcirclepositions, 'positions', getcirclepositions_positions_binding));
    	let each_value = /*positions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			create_component(setsvgwidthandheight.$$.fragment);
    			t = space();
    			svg = svg_element("svg");
    			rect = svg_element("rect");
    			create_component(getcirclepositions.$$.fragment);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect, "width", /*$svgWidth*/ ctx[1]);
    			attr_dev(rect, "height", /*$svgHeight*/ ctx[2]);
    			attr_dev(rect, "stroke", "black");
    			attr_dev(rect, "stroke-width", "3px");
    			attr_dev(rect, "fill", "none");
    			add_location(rect, file$1, 11, 2, 402);
    			attr_dev(svg, "width", /*$svgWidth*/ ctx[1]);
    			attr_dev(svg, "height", /*$svgHeight*/ ctx[2]);
    			add_location(svg, file$1, 10, 0, 356);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(setsvgwidthandheight, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, rect);
    			mount_component(getcirclepositions, svg, null);

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

    			if (!current || dirty & /*$svgHeight*/ 4) {
    				attr_dev(rect, "height", /*$svgHeight*/ ctx[2]);
    			}

    			const getcirclepositions_changes = {};

    			if (!updating_positions && dirty & /*positions*/ 1) {
    				updating_positions = true;
    				getcirclepositions_changes.positions = /*positions*/ ctx[0];
    				add_flush_callback(() => updating_positions = false);
    			}

    			getcirclepositions.$set(getcirclepositions_changes);

    			if (dirty & /*positions, $outerRadius, $presidents*/ 25) {
    				each_value = /*positions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*$svgWidth*/ 2) {
    				attr_dev(svg, "width", /*$svgWidth*/ ctx[1]);
    			}

    			if (!current || dirty & /*$svgHeight*/ 4) {
    				attr_dev(svg, "height", /*$svgHeight*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(setsvgwidthandheight.$$.fragment, local);
    			transition_in(getcirclepositions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(setsvgwidthandheight.$$.fragment, local);
    			transition_out(getcirclepositions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(setsvgwidthandheight, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(svg);
    			destroy_component(getcirclepositions);
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
    	let $svgHeight;
    	let $outerRadius;
    	let $presidents;
    	validate_store(svgWidth, 'svgWidth');
    	component_subscribe($$self, svgWidth, $$value => $$invalidate(1, $svgWidth = $$value));
    	validate_store(svgHeight, 'svgHeight');
    	component_subscribe($$self, svgHeight, $$value => $$invalidate(2, $svgHeight = $$value));
    	validate_store(outerRadius, 'outerRadius');
    	component_subscribe($$self, outerRadius, $$value => $$invalidate(3, $outerRadius = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(4, $presidents = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svg', slots, []);
    	let positions = [];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	function getcirclepositions_positions_binding(value) {
    		positions = value;
    		$$invalidate(0, positions);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		SetSvgWidthAndHeight,
    		svgWidth,
    		svgHeight,
    		outerRadius,
    		GetCirclePositions,
    		presidents,
    		positions,
    		$svgWidth,
    		$svgHeight,
    		$outerRadius,
    		$presidents
    	});

    	$$self.$inject_state = $$props => {
    		if ('positions' in $$props) $$invalidate(0, positions = $$props.positions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		positions,
    		$svgWidth,
    		$svgHeight,
    		$outerRadius,
    		$presidents,
    		getcirclepositions_positions_binding
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
