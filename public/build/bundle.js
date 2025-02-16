
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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

    const svgWidth = writable(0);
    const svgHeight = writable(0);
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

    const { console: console_1 } = globals;

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
    	let positions;
    	let $presidents;
    	let $titleSpace;
    	let $outerRadius;
    	let $rowSpacing;
    	let $circleSpacing;
    	let $svgWidth;
    	let $maxCirclesPerRow;
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(1, $presidents = $$value));
    	validate_store(titleSpace, 'titleSpace');
    	component_subscribe($$self, titleSpace, $$value => $$invalidate(2, $titleSpace = $$value));
    	validate_store(outerRadius, 'outerRadius');
    	component_subscribe($$self, outerRadius, $$value => $$invalidate(3, $outerRadius = $$value));
    	validate_store(rowSpacing, 'rowSpacing');
    	component_subscribe($$self, rowSpacing, $$value => $$invalidate(4, $rowSpacing = $$value));
    	validate_store(circleSpacing, 'circleSpacing');
    	component_subscribe($$self, circleSpacing, $$value => $$invalidate(5, $circleSpacing = $$value));
    	validate_store(svgWidth, 'svgWidth');
    	component_subscribe($$self, svgWidth, $$value => $$invalidate(6, $svgWidth = $$value));
    	validate_store(maxCirclesPerRow, 'maxCirclesPerRow');
    	component_subscribe($$self, maxCirclesPerRow, $$value => $$invalidate(7, $maxCirclesPerRow = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GetCirclePositions', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<GetCirclePositions> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		maxCirclesPerRow,
    		svgWidth,
    		outerRadius,
    		circleSpacing,
    		rowSpacing,
    		titleSpace,
    		presidents,
    		positions,
    		$presidents,
    		$titleSpace,
    		$outerRadius,
    		$rowSpacing,
    		$circleSpacing,
    		$svgWidth,
    		$maxCirclesPerRow
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

    		if ($$self.$$.dirty & /*positions*/ 1) {
    			console.log("Positions:", positions);
    		}

    		if ($$self.$$.dirty & /*$presidents*/ 2) {
    			console.log("presidents:", $presidents);
    		}
    	};

    	return [
    		positions,
    		$presidents,
    		$titleSpace,
    		$outerRadius,
    		$rowSpacing,
    		$circleSpacing,
    		$svgWidth,
    		$maxCirclesPerRow
    	];
    }

    class GetCirclePositions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GetCirclePositions",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Svg.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/components/Svg.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let rect;
    	let setsvgwidthandheight;
    	let getcirclepositions;
    	let current;
    	setsvgwidthandheight = new SetSvgWidthAndHeight({ $$inline: true });
    	getcirclepositions = new GetCirclePositions({ $$inline: true });

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			rect = svg_element("rect");
    			create_component(setsvgwidthandheight.$$.fragment);
    			create_component(getcirclepositions.$$.fragment);
    			attr_dev(rect, "width", /*$svgWidth*/ ctx[0]);
    			attr_dev(rect, "height", /*$svgHeight*/ ctx[1]);
    			attr_dev(rect, "stroke", "black");
    			attr_dev(rect, "stroke-width", "3px");
    			attr_dev(rect, "fill", "none");
    			add_location(rect, file$1, 8, 2, 287);
    			attr_dev(svg, "width", /*$svgWidth*/ ctx[0]);
    			attr_dev(svg, "height", /*$svgHeight*/ ctx[1]);
    			add_location(svg, file$1, 7, 0, 241);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, rect);
    			mount_component(setsvgwidthandheight, svg, null);
    			mount_component(getcirclepositions, svg, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$svgWidth*/ 1) {
    				attr_dev(rect, "width", /*$svgWidth*/ ctx[0]);
    			}

    			if (!current || dirty & /*$svgHeight*/ 2) {
    				attr_dev(rect, "height", /*$svgHeight*/ ctx[1]);
    			}

    			if (!current || dirty & /*$svgWidth*/ 1) {
    				attr_dev(svg, "width", /*$svgWidth*/ ctx[0]);
    			}

    			if (!current || dirty & /*$svgHeight*/ 2) {
    				attr_dev(svg, "height", /*$svgHeight*/ ctx[1]);
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
    			if (detaching) detach_dev(svg);
    			destroy_component(setsvgwidthandheight);
    			destroy_component(getcirclepositions);
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
    	validate_store(svgWidth, 'svgWidth');
    	component_subscribe($$self, svgWidth, $$value => $$invalidate(0, $svgWidth = $$value));
    	validate_store(svgHeight, 'svgHeight');
    	component_subscribe($$self, svgHeight, $$value => $$invalidate(1, $svgHeight = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svg', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		SetSvgWidthAndHeight,
    		svgWidth,
    		svgHeight,
    		GetCirclePositions,
    		$svgWidth,
    		$svgHeight
    	});

    	return [$svgWidth, $svgHeight];
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
