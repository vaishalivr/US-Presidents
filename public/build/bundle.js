
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
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
    const selectedCircleId = writable(null);

    const presidents = writable([
      {
        name: "George Washington",
        terms: 2,
        status: "dead",
        birthYear: 1732,
        birthPlace: "Westmoreland County, Virginia",
        parents: "Augustine Washington and Mary Ball Washington",
        deathYear: 1799,
        deathPlace: "Mount Vernon, Virginia",
        deathReason: "Epiglottitis or pneumonia",
        presidencyStart: 1789,
        presidencyEnd: 1797,
        keyPolicies: 8,
        policies: [
          "Judiciary Act of 1789 : Established the federal judiciary, including the Supreme Court, circuit courts, and district courts.",
          "First National Bank (1791) : Championed by Alexander Hamilton, Washington supported the creation of a national bank to stabilize the economy.",
          "Bill of Rights (1791) : Ratified during his presidency, ensuring fundamental liberties for citizens.",
          "Proclamation of Neutrality (1793) : Declared the U.S. neutral in the war between France and Britain, preventing early entanglement in European conflicts.",
          "Whiskey Rebellion Suppression (1794) : Sent federal troops to put down a tax protest, reinforcing the strength of the federal government.",
          "Jay Treaty (1795) : A controversial treaty with Britain that sought to resolve lingering issues from the Revolutionary War and promote trade.",
          "Pinckney’s Treaty (1795) : Agreement with Spain that granted the U.S. navigation rights on the Mississippi River and access to New Orleans.",
          "Farewell Address (1796) : Though not a law, his address warned against political parties and entangling foreign alliances, shaping U.S. policy for years.",
        ],
        party: "None",
        spouse: "Martha Custis",
        children: "None",
        occupationBeforePresidency: "Farmer and Soldier",
        quote:
          "To be prepared for war is one of the most effective means of preserving peace.",
        image: "images/GeorgeWashington.png",
        otherPresidents: [
          "John Adams",
          "Thomas Jefferson",
          "James Madison",
          "James Monroe",
          "John Quincy Adams",
        ],
        otherPresidentThings: [
          { "John Adams": "Vice President of the US" },
          {
            "Thomas Jefferson":
              "Served as Washington's first Secretary of State but resigned in 1793 due to conflicts with Washington and Alexander Hamilton",
            "James Madison":
              "Member of the U.S. House of Representatives (1789-1797) and helped form the Democratic-Republican Party with Jefferson",
          },
          { "James Monroe": "U.S. Minister to France (1794-1796), later recalled" },
          {
            "John Quincy Adams":
              "Graduated from Harvard University in 1787 and began studying law. Admitted to the bar in 1790, he started practicing law in Boston",
          },
        ],
      },
      {
        name: "John Adams",
        terms: 2,
        status: "dead",
        birthYear: 1735,
        birthPlace: "Braintree, Massachusetts",
        parents: "John Adams Sr. and Susanna Boylston",
        deathYear: 1826,
        deathPlace: "Quincy, Massachusetts",
        deathReason: "Heart failure and natural causes",
        presidencyStart: 1797,
        presidencyEnd: 1801,
        keyPolicies: 9,
        policies: [
          "Alien and Sedition Acts (1798) : A series of laws that made it harder for immigrants to become citizens, allowed the president to deport non-citizens deemed dangerous, and criminalized criticism of the government.",
          "XYZ Affair (1797-1798) : A diplomatic scandal in which French agents demanded bribes from U.S. envoys, leading to the Quasi-War with France.",
          "Quasi-War with France (1798-1800) : An undeclared naval war between the U.S. and France, leading Adams to strengthen the U.S. Navy.",
          "Creation of the Department of the Navy (1798) : Established a permanent U.S. Navy to counter threats from France and other nations.",
          "Midnight Appointments (1801) : Adams appointed numerous Federalist judges, including Chief Justice John Marshall, shaping U.S. law for decades.",
          "Naturalization Act of 1798 : Increased the residency requirement for citizenship from 5 to 14 years, making it harder for immigrants to become citizens.",
          "Treaty of Mortefontaine (1800) : Ended hostilities between the U.S. and France, preventing an all-out war.",
          "Direct Tax of 1798 : Imposed a federal property tax, which led to protests such as Fries' Rebellion in Pennsylvania.",
          "Virginia and Kentucky Resolutions response (1798-1799) : Though not his policy, these resolutions by Jefferson and Madison challenged the Alien and Sedition Acts, arguing states could nullify federal laws.",
        ],
        party: "Federalist",
        spouse: "Abigail Adams",
        children: "None",
        occupationBeforePresidency: "Lawyer",
        quote:
          "I must study politics and war that my sons may have liberty to study mathematics and philosophy.",
        image: "images/JohnAdams.png",
        otherPresidents: [
          "George Washington",
          "Thomas Jefferson",
          "James Madison",
          "James Monroe",
          "John Quincy Adams",
          "Andrew Jackson",
          "Martin Van Buren",
          "William Henry Harrison",
        ],
        otherPresidentThings: [
          {
            "George Washington":
              "returned to his Mount Vernon estate in Virginia, focusing on managing his plantation. Reappointed Commander-in-Chief during Quasi-War with France",
          },
          {
            "Thomas Jefferson":
              "Jefferson lost the 1796 presidential election to John Adams. At the time, the candidate with the second-most votes became Vice President, so he served under Adams despite being from an opposing political party. This created serious tensions in the government. In 1800 Ran against Adams, won the election",
          },
          {
            "James Madison":
              "Democratic-Republican leader, opposed Adams, co-wrote Virginia Resolution (1798)",
          },
          {
            "James Monroe":
              "U.S. Senator (1799-1802), opposed Adams, supported Jefferson's 1800 election",
          },
          {
            "John Quincy Adams":
              "U.S. Minister to Prussia (1797-1801), worked on trade agreements",
          },
          {
            "Andrew Jackson":
              "U.S. Senator (1797-1798), Tennessee Supreme Court Judge (1798-1804)",
          },
          {
            "Martin Van Buren":
              "New York State Senator (1799-1803), emerging Democratic-Republican leader",
          },
          {
            "William Henry Harrison":
              "Served in the U.S. Army, fought in Indian Wars(1791-1798), Secretary of the Northwest Territory, appointed by Adams(1798-1799), 	Delegate to U.S. Congress for Northwest Territory(1799-1801)",
          },
        ],
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
        policies: [
          "Louisiana Purchase (1803) : Doubled the size of the United States by acquiring 828,000 square miles of land from France for $15 million.",
          "Embargo Act of 1807 : Prohibited American ships from trading with foreign nations, aimed at pressuring Britain and France to respect U.S. neutrality but severely hurt the U.S. economy.",
          "Marbury v. Madison (1803) : Though not a policy, this Supreme Court decision established judicial review, strengthening the judiciary.",
          "Reduction of National Debt : Jefferson significantly cut federal spending and reduced the national debt by slashing military expenditures.",
          "Abolition of Internal Taxes : Repealed various federal taxes, such as the whiskey tax, reducing the tax burden on citizens.",
          "Lewis and Clark Expedition (1804-1806) : Commissioned an expedition to explore the newly acquired Louisiana Territory, mapping out the land and establishing relations with Native American tribes.",
          "Non-Intercourse Act (1809) : Replaced the Embargo Act, reopening trade with all nations except Britain and France to mitigate economic damage.",
          "Slave Trade Act of 1807 : Signed into law, prohibiting the importation of slaves into the U.S.",
          "Military and Naval Reductions : Reduced the standing army and navy, favoring state militias over a large federal military.",
          "Tripolitan War (1801-1805) : The first Barbary War against North African pirates, demonstrating the U.S. naval strength and asserting maritime rights.",
          "Yazoo Land Scandal Resolution (1802) : Helped resolve land disputes in Georgia by compensating claimants and transferring land to federal control.",
          "Twelfth Amendment (1804) : Changed the process of electing the president and vice president, requiring them to be elected as a ticket rather than separately.",
        ],
        party: "Democratic-Republican",
        spouse: "Martha Wayles Skelton Jefferson",
        children: "None",
        occupationBeforePresidency: "Planter and Lawyer",
        quote:
          "The man who reads nothing at all is better educated than the man who reads nothing but newspapers.",
        image: "images/ThomasJefferson.png",
      },
      {
        name: "James Madison",
        terms: 2,
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
        policies: [
          "War of 1812 (1812-1815) : A major conflict between the U.S. and Britain over maritime rights, impressment of American sailors, and British support for Native American resistance. The war solidified U.S. sovereignty but ended in a stalemate.",
          "Treaty of Ghent (1814) : Officially ended the War of 1812, restoring pre-war borders between the U.S. and Britain but failing to resolve many of the war’s original causes.",
          "Creation of the Second Bank of the United States (1816) : Established to provide financial stability after the economic strain of the war, helping regulate currency and credit.",
          "Tariff of 1816 : The first protective tariff in U.S. history, designed to protect American manufacturing by taxing imported goods, making domestic products more competitive.",
          "Macon’s Bill No. 2 (1810) : A policy that reopened trade with Britain and France but threatened an embargo if either nation interfered with American shipping. It failed to prevent tensions leading to the War of 1812.",
          "Expansion of the U.S. Military : Strengthened the U.S. Army and Navy after recognizing weaknesses during the War of 1812, leading to improvements in national defense.",
          "Federal Internal Improvements Plan : Proposed using federal funds for infrastructure like roads and canals, though Madison vetoed the Bonus Bill, believing states should fund such projects.",
          "Rush-Bagot Agreement (1817) : A treaty with Britain that limited naval armaments on the Great Lakes, helping to ease U.S.-British tensions and laying the groundwork for peaceful U.S.-Canada relations.",
        ],

        party: "Democratic-Republican",
        spouse: "Dolley Payne Todd Madison",
        children: "None",
        occupationBeforePresidency: "Farmer and Politician",
        quote:
          "The means of defense against foreign danger have always been the instruments of tyranny at home.",
        image: "images/JamesMadison.png",
      },
      {
        name: "James Monroe",
        terms: 2,
        status: "dead",
        birthYear: 1758,
        birthPlace: "Westmoreland County, Virginia",
        parents: "Spence Monroe and Elizabeth Jones",
        deathYear: 1831,
        deathPlace: "New York City, New York",
        deathReason: "Tuberculosis",
        presidencyStart: 1817,
        presidencyEnd: 1825,
        keyPolicies: 8,
        policies: [
          "Monroe Doctrine (1823) : Declared that European powers should not interfere in the Western Hemisphere, asserting U.S. dominance in the Americas and shaping foreign policy for decades.",
          "Missouri Compromise (1820) : Allowed Missouri to enter as a slave state and Maine as a free state, maintaining the balance of power between free and slave states in Congress.",
          "Acquisition of Florida (1819) : Secured Florida from Spain through the Adams-Onís Treaty, expanding U.S. territory.",
          "Panic of 1819 : The first major financial crisis in U.S. history, caused by land speculation and unstable banking practices, leading to widespread economic hardship.",
          "Cumberland Road Expansion : Supported federal funding for infrastructure improvements, particularly roads and canals, to enhance national transportation.",
          "Era of Good Feelings : Though not a policy, this period during Monroe’s presidency was characterized by political unity and the decline of the Federalist Party.",
          "Reduction of Military Spending : Monroe reduced military expenditures while strengthening coastal defenses and fortifications.",
          "Recognition of Latin American Independence : The U.S. formally recognized the independence of several Latin American nations from Spain, reinforcing the Monroe Doctrine.",
        ],
        party: "Democratic-Republican",
        spouse: "Elizabeth Kortright Monroe",
        children: "3",
        occupationBeforePresidency: "Lawyer and Soldier",
        quote: "National honor is the national property of the highest value.",
        image: "images/JamesMonroe.png",
      },
      {
        name: "John Quincy Adams",
        status: "dead",
        birthYear: 1767,
        birthPlace: "Braintree, Massachusetts",
        parents: "John Adams and Abigail Adams",
        deathYear: 1848,
        deathPlace: "Washington, D.C.",
        deathReason: "Stroke",
        presidencyStart: 1825,
        presidencyEnd: 1829,
        keyPolicies: 8,
        policies: [
          "Tariff of 1828 (Tariff of Abominations) : Raised import duties on imported goods, which benefited Northern industries but caused economic tensions in the South.",
          "Erie Canal Completion (1825) : Expanded trade and transportation routes, boosting economic development and connecting the Great Lakes with the Atlantic Ocean.",
          "Support for the American System : Advocated for infrastructure improvements, tariffs to protect U.S. industries, and a national bank to support economic growth.",
          "Expansion of Education : Promoted public education, federal funding for research institutions, and scientific advancements.",
          "Naval Expansion : Strengthened the U.S. Navy to protect American commerce and national security.",
          "Standardization of Weights and Measures : Pushed for a uniform system of weights and measures to facilitate trade and commerce.",
          "Diplomatic Engagement with Latin America : Sought to strengthen ties with newly independent Latin American nations through diplomatic missions.",
          "Creation of the Department of Interior Proposal : Proposed a department to manage internal improvements and land policies, though it was not established during his presidency.",
        ],
        party: "Democratic-Republican",
        spouse: "Louisa Catherine Johnson Adams",
        children: "4",
        occupationBeforePresidency: "Diplomat and Lawyer",
        quote:
          "If your actions inspire others to dream more, learn more, do more, and become more, you are a leader.",
        image: "images/JohnQuincyAdams.png",
      },
      {
        name: "Andrew Jackson",
        terms: 2,
        status: "dead",
        birthYear: 1767,
        birthPlace: "Waxhaws region, South Carolina/North Carolina",
        parents: "Andrew Jackson Sr. and Elizabeth Hutchinson Jackson",
        deathYear: 1845,
        deathPlace: "Nashville, Tennessee",
        deathReason: "Tuberculosis and natural causes",
        presidencyStart: 1829,
        presidencyEnd: 1837,
        keyPolicies: 10,
        policies: [
          "Indian Removal Act (1830) : Forced Native American tribes to relocate west of the Mississippi River, leading to the Trail of Tears.",
          "Nullification Crisis (1832-1833) : Confronted South Carolina’s attempt to nullify federal tariffs, reinforcing federal authority and preventing secession.",
          "Bank War (1832) : Vetoed the renewal of the Second Bank of the United States, leading to its dissolution and shifting federal funds to state banks (pet banks).",
          "Specie Circular (1836) : Required government land purchases to be made in gold or silver instead of paper money, contributing to the Panic of 1837.",
          "Creation of the Democratic Party : Established the Democratic Party as a major political force, representing the interests of the common man.",
          "Maysville Road Veto (1830) : Vetoed a bill funding a Kentucky road project, arguing that infrastructure projects should be funded by states rather than the federal government.",
          "Peggy Eaton Affair : A social and political scandal that influenced Jackson’s cabinet reshuffling and loyalty among his advisors.",
          "Force Bill (1833) : Authorized Jackson to use military force to ensure compliance with federal tariff laws in response to the Nullification Crisis.",
          "Expansion of Executive Power : Strengthened the presidency by using the veto power more than all previous presidents combined, reshaping the balance of power in government.",
          "Panic of 1837 : Although it occurred shortly after his presidency, Jackson’s financial policies, including the Bank War and Specie Circular, contributed to the economic downturn.",
        ],
        party: "Democratic",
        spouse: "Rachel Donelson Robards Jackson",
        children: "None",
        occupationBeforePresidency: "Lawyer and Military Leader",
        quote: "One man with courage makes a majority.",
      },
      {
        name: "Martin Van Buren",
        status: "dead",
        birthYear: 1782,
        birthPlace: "Kinderhook, New York",
        parents: "Abraham Van Buren and Maria Hoes",
        deathYear: 1862,
        deathPlace: "Kinderhook, New York",
        deathReason: "Pneumonia",
        presidencyStart: 1837,
        presidencyEnd: 1841,
        keyPolicies: 8,
        policies: [
          "Panic of 1837 : A severe economic depression that began shortly after Van Buren took office, caused by Jackson’s financial policies, land speculation, and the collapse of state banks.",
          "Independent Treasury Act (1840) : Established a system where federal funds would be stored in government vaults instead of private banks, aiming to stabilize the economy.",
          "Opposition to the Annexation of Texas : Refused to annex Texas, fearing it would lead to conflict with Mexico and intensify sectional tensions over slavery.",
          "Continuation of Indian Removal : Enforced the policies initiated under Andrew Jackson, including the forced relocation of Native American tribes such as the Cherokee.",
          "Neutrality in Canadian Rebellion (1837-1838) : Enforced strict neutrality when Canadian rebels sought U.S. support, preventing war with Britain.",
          "Enforcement of the Gag Rule : Supported a congressional rule that prevented discussions on anti-slavery petitions, reflecting his cautious stance on slavery.",
          "Amistad Case (1839) : His administration opposed granting freedom to enslaved Africans who had taken control of the Amistad ship, arguing they should be returned to Spain, though the Supreme Court later ruled in favor of their freedom.",
          "Expansion of Labor Rights : Supported the 10-hour workday for federal employees, an early step toward labor reform.",
        ],
        party: "Democratic",
        spouse: "Hannah Hoes Van Buren",
        children: "5",
        occupationBeforePresidency: "Lawyer and Politician",
        quote: "It is easier to do a job right than to explain why you didn’t.",
      },
      {
        name: "William Henry Harrison",
        status: "dead",
        birthYear: 1773,
        birthPlace: "Berkeley Plantation, Virginia",
        parents: "Benjamin Harrison V and Elizabeth Bassett Harrison",
        deathYear: 1841,
        deathPlace: "Washington, D.C.",
        deathReason: "Pneumonia",
        presidencyStart: 1841,
        presidencyEnd: 1841,
        keyPolicies: 5,
        policies: [
          "First Presidential Inauguration Speech (1841) : Delivered the longest inaugural address in U.S. history, emphasizing a strict interpretation of the Constitution and opposition to executive overreach.",
          "Whig Party Economic Agenda : Planned to implement the Whig Party's policies, including re-establishing a national bank and promoting infrastructure projects, though he died before enacting them.",
          "Limited Presidential Veto : Expressed opposition to excessive use of the presidential veto, aiming to restore Congressional authority over policymaking.",
          "Civil Service Reform Intentions : Planned to reduce the influence of the 'spoils system' by limiting political appointments to qualified individuals rather than party loyalists.",
          "Western Expansion Support : Supported policies favoring the settlement of western territories, continuing the expansionist vision of the U.S.",
        ],
        party: "Whig",
        spouse: "Anna Tuthill Symmes Harrison",
        children: "10",
        occupationBeforePresidency: "Military Officer and Politician",
        quote:
          "The liberties of a people depend on their own constant attention to its preservation.",
        notes: "Died only after 32 days in office.",
      },
      {
        name: "John Tyler",
        status: "dead",
        birthYear: 1790,
        birthPlace: "Charles City County, Virginia",
        parents: "John Tyler Sr. and Mary Ball",
        deathYear: 1862,
        deathPlace: "Richmond, Virginia",
        deathReason: "Stroke",
        presidencyStart: 1841,
        presidencyEnd: 1845,
        keyPolicies: 10,
        policies: [
          "Annexation of Texas (1845) : Signed the resolution to annex Texas into the United States, which later led to tensions with Mexico and the Mexican-American War.",
          "Veto of National Bank Bills (1841) : Vetoed two bills proposed by the Whig Party to establish a new national bank, leading to his expulsion from the Whig Party.",
          "Webster-Ashburton Treaty (1842) : Settled border disputes between the U.S. and British Canada, particularly in Maine and Minnesota.",
          "Preemption Act of 1841 : Allowed squatters on federal lands to purchase the land before it was offered for sale to the public, encouraging westward expansion.",
          "Treaty of Wanghia (1844) : The first trade treaty between the U.S. and China, granting America 'most favored nation' status in trade relations.",
          "Dorr Rebellion Response (1842) : Refused to intervene in Rhode Island’s political crisis, affirming state control over its own electoral laws.",
          "Log Cabin Bill (1841) : Provided settlers with 160 acres of public land at low prices, further supporting western expansion.",
          "Opposition to Tariff of 1842 : Initially opposed, but later signed a higher protective tariff to increase government revenue.",
          "Strengthening the U.S. Navy : Expanded and modernized the U.S. Navy, particularly for international trade and protection of American interests.",
          "Failed Impeachment Attempt (1842) : Became the first U.S. president to face an impeachment resolution, though it did not pass in Congress.",
        ],
        party: "Whig",
        spouse: "Letitia Christian Tyler",
        children: "8",
        occupationBeforePresidency: "Lawyer and Politician",
        quote:
          "Wealth can only be accumulated by the earnings of industry and the savings of frugality.",
        note: "John Tyler, often called “His Accidency”, had a presidency marked by clashes with his own party, the Whigs, and a focus on expansionist policies. ",
      },
      {
        name: "James K. Polk",
        status: "dead",
        birthYear: 1795,
        birthPlace: "Pineville, North Carolina",
        parents: "Samuel Polk and Jane Knox",
        deathYear: 1849,
        deathPlace: "Nashville, Tennessee",
        deathReason: "Cholera",
        presidencyStart: 1845,
        presidencyEnd: 1849,
        keyPolicies: 10,
        policies: [
          "Oregon Treaty (1846) : Established the northern boundary of the U.S. at the 49th parallel, securing Oregon Territory from Britain without conflict.",
          "Mexican-American War (1846-1848) : Led to the U.S. victory over Mexico, resulting in the acquisition of a vast territory in the Southwest.",
          "Treaty of Guadalupe Hidalgo (1848) : Ended the Mexican-American War and ceded California, Arizona, New Mexico, and other territories to the U.S.",
          "Annexation of Texas (1845) : Officially brought Texas into the Union, fulfilling Polk’s expansionist vision but increasing tensions with Mexico.",
          "Independent Treasury System (1846) : Re-established a system for managing government funds separately from private banks, ensuring financial stability.",
          "Walker Tariff (1846) : Lowered tariffs on imports, promoting free trade and benefiting Southern agricultural interests.",
          "Wilmot Proviso Debate (1846) : Though not passed, it proposed banning slavery in territories acquired from Mexico, sparking sectional tensions.",
          "Expansion of the U.S. Navy : Strengthened the U.S. Navy to support international trade and military actions.",
          "Smithsonian Institution Established (1846) : Signed into law the creation of the Smithsonian Institution, promoting education and research.",
          "California Gold Rush (1848) : Though not a direct policy, Polk’s acquisition of California set the stage for the Gold Rush and westward expansion.",
        ],
        party: "Democratic",
        spouse: "Sarah Childress Polk",
        children: "None",
        occupationBeforePresidency: "Lawyer",
        quote:
          "No president who performs his duties faithfully and conscientiously can have any leisure.",
      },
      {
        name: "Zachary Taylor",
        status: "dead",
        birthYear: 1784,
        birthPlace: "Barboursville, Virginia",
        parents: "Richard Taylor and Sarah Strother",
        deathYear: 1850,
        deathPlace: "Washington, D.C.",
        deathReason: "Gastroenteritis",
        presidencyStart: 1849,
        presidencyEnd: 1850,
        keyPolicies: 8,
        policies: [
          "Compromise of 1850 Opposition : Opposed the expansion of slavery into newly acquired territories, resisting efforts to pass the Compromise of 1850 during his presidency.",
          "California Statehood (1849) : Supported California’s bid for statehood as a free state, intensifying tensions between the North and South over slavery.",
          "Utah and New Mexico Territorial Governments : Advocated for the organization of Utah and New Mexico territories without immediate decisions on slavery, leaving the issue to local governance.",
          "Clayton-Bulwer Treaty (1850) : Signed a treaty with Britain that ensured neither country would colonize or control any future canal across Central America.",
          "Enforcement of Federal Authority : Threatened to use military force against Southern states considering secession over the slavery debate.",
          "Support for Infrastructure : Advocated for internal improvements such as roads and canals but took a limited federal approach to funding them.",
          "Relations with Native Americans : Continued previous policies of relocating Native American tribes to reservations to make way for westward expansion.",
          "Limited Government Spending : Promoted fiscal responsibility and opposed excessive federal expenditures.",
        ],
        party: "Whig",
        spouse: "Margaret Mackall Smith Taylor",
        children: "6",
        occupationBeforePresidency: "Military Officer",
        quote:
          "I have always done my duty. I am ready to die. My only regret is for the friends I leave behind me.",
      },
      {
        name: "Millard Fillmore",
        status: "dead",
        birthYear: 1800,
        birthPlace: "Summerhill, New York",
        parents: "Nathaniel Fillmore and Phoebe Millard",
        deathYear: 1874,
        deathPlace: "Buffalo, New York",
        deathReason: "Stroke",
        presidencyStart: 1850,
        presidencyEnd: 1853,
        keyPolicies: 8,
        policies: [
          "Compromise of 1850 : Signed into law a series of bills that attempted to ease tensions between free and slave states, including the admission of California as a free state and the Fugitive Slave Act.",
          "Fugitive Slave Act (1850) : Enforced stricter laws requiring the return of escaped enslaved individuals, angering Northern abolitionists.",
          "Texas-New Mexico Boundary Act (1850) : Resolved the border dispute between Texas and New Mexico, giving federal government control over the disputed land.",
          "Abolition of the Slave Trade in Washington, D.C. (1850) : As part of the Compromise of 1850, ended the slave trade (but not slavery) in the nation’s capital.",
          "Expansion of Trade with Japan : Sent Commodore Matthew Perry to open trade relations with Japan, leading to the Treaty of Kanagawa in 1854.",
          "Support for the Transcontinental Railroad : Pushed for infrastructure improvements, including early efforts toward a transcontinental railroad.",
          "Enforcement of Federal Authority : Used federal power to maintain law and order, including suppressing secessionist movements.",
          "Cuba Annexation Attempt (Lopez Expeditions) : Took a neutral stance while some Americans attempted to annex Cuba, an effort that ultimately failed.",
        ],
        party: "Whig",
        spouse: "Abigail Powers Fillmore",
        children: "2",
        occupationBeforePresidency: "Lawyer",
        quote:
          "The nourishment of a nation depends on the health of its democracy.",
      },
      {
        name: "Franklin Pierce",
        status: "dead",
        birthYear: 1804,
        birthPlace: "Hillsborough, New Hampshire",
        parents: "Benjamin Pierce and Anna Kendrick",
        deathYear: 1869,
        deathPlace: "Concord, New Hampshire",
        deathReason: "Pneumonia",
        presidencyStart: 1853,
        presidencyEnd: 1857,
        keyPolicies: 8,
        policies: [
          "Kansas-Nebraska Act (1854) : Repealed the Missouri Compromise and allowed settlers in Kansas and Nebraska to determine the status of slavery, leading to violent conflicts known as 'Bleeding Kansas.'",
          "Gadsden Purchase (1854) : Acquired land from Mexico (southern Arizona and southwestern New Mexico) to facilitate the construction of a southern transcontinental railroad.",
          "Enforcement of the Fugitive Slave Act : Strictly enforced laws requiring the return of escaped enslaved individuals, increasing tensions between the North and South.",
          "Expansion of Trade with Japan : Supported the success of Commodore Matthew Perry’s expedition, leading to the Treaty of Kanagawa (1854), opening Japan to U.S. trade.",
          "Ostend Manifesto (1854) : Secretly supported an unsuccessful attempt to purchase or seize Cuba from Spain to expand slavery, leading to controversy when it was exposed.",
          "Diplomatic Relations with Latin America : Worked to expand U.S. influence in Central and South America, including attempts to acquire more territory.",
          "Economic Growth Policies : Encouraged infrastructure expansion, including railroad development, to promote westward expansion and commerce.",
          "Civil Service Appointments Based on Party Loyalty : Strengthened the 'spoils system' by rewarding government positions to loyal Democrats, leading to political corruption.",
        ],
        party: "Democratic",
        spouse: "Jane Means Appleton Pierce",
        children: "3",
        occupationBeforePresidency: "Lawyer and Politician",
        quote:
          "The storm of frenzy and faction must inevitably dash itself in vain against the unshaken rock of the Constitution.",
      },
      {
        name: "James Buchanan",
        status: "dead",
        birthYear: 1791,
        birthPlace: "Cove Gap, Pennsylvania",
        parents: "James Buchanan Sr. and Elizabeth Speer",
        deathYear: 1868,
        deathPlace: "Lancaster, Pennsylvania",
        deathReason: "Pneumonia",
        presidencyStart: 1857,
        presidencyEnd: 1861,
        keyPolicies: 8,
        policies: [
          "Dred Scott Decision Support (1857) : Endorsed the Supreme Court’s ruling that African Americans were not citizens and that Congress could not prohibit slavery in the territories.",
          "Lecompton Constitution (1857) : Supported a pro-slavery constitution for Kansas statehood, despite opposition from anti-slavery settlers, worsening sectional tensions.",
          "Panic of 1857 : Responded weakly to a major economic downturn caused by land speculation and banking failures, disproportionately affecting the North.",
          "Utah War (1857-1858) : Sent federal troops to Utah to suppress a rebellion by Mormon settlers, though it was resolved peacefully.",
          "Ostend Manifesto Fallout : Continued expansionist goals to acquire Cuba but faced strong opposition after earlier diplomatic efforts were exposed and condemned.",
          "Crittenden Compromise Rejection (1860) : Declined to support a last-minute compromise that sought to prevent secession by allowing the expansion of slavery.",
          "Secession Crisis Inaction (1860-1861) : Failed to prevent Southern states from seceding after Lincoln’s election, arguing that the federal government had no authority to stop them.",
          "Strengthening of Fort Sumter : Refused to surrender federal forts to the Confederacy, indirectly setting the stage for the Civil War.",
        ],
        party: "Democratic",
        spouse: "None",
        children: "None",
        occupationBeforePresidency: "Diplomat and Lawyer",
        quote: "The ballot box is the surest arbiter of disputes among free men.",
      },
      {
        name: "Abraham Lincoln",
        status: "dead",
        birthYear: 1809,
        birthPlace: "Hodgenville, Kentucky",
        parents: "Thomas Lincoln and Nancy Hanks",
        deathYear: 1865,
        deathPlace: "Washington, D.C.",
        deathReason: "Assassination",
        presidencyStart: 1861,
        presidencyEnd: 1865,
        keyPolicies: 10,
        policies: [
          "Emancipation Proclamation (1863) : Declared all enslaved people in Confederate-held territories to be free, shifting the Civil War's focus to ending slavery.",
          "Homestead Act (1862) : Provided 160 acres of free public land to settlers who agreed to cultivate it for at least five years, promoting westward expansion.",
          "Pacific Railway Act (1862) : Authorized the construction of the Transcontinental Railroad, connecting the east and west coasts and boosting economic growth.",
          "Morrill Land-Grant Act (1862) : Granted federal land to states to establish agricultural and technical colleges, improving education and innovation.",
          "National Banking Act (1863) : Established a national banking system and uniform currency, stabilizing the U.S. economy during the Civil War.",
          "Suspension of Habeas Corpus (1861) : Temporarily suspended habeas corpus to arrest and detain suspected Confederate sympathizers without trial, increasing executive power.",
          "Ten-Percent Plan (1863) : Proposed a lenient Reconstruction policy that allowed Confederate states to rejoin the Union if 10% of voters swore loyalty to the U.S.",
          "13th Amendment (1865) : Pushed for the constitutional amendment that abolished slavery in the United States, ensuring a permanent end to the institution.",
          "Revenue Act of 1862 : Established the first progressive income tax to fund the Union war effort during the Civil War.",
          "Establishment of the U.S. Secret Service (1865) : Created the Secret Service on the day of his assassination, originally to combat counterfeiting but later expanded to protect the president.",
        ],
        party: "Republican",
        spouse: "Mary Todd Lincoln",
        children: "4",
        occupationBeforePresidency: "Lawyer",
        quote:
          "Government of the people, by the people, for the people, shall not perish from the Earth.",
      },
      {
        name: "Andrew Johnson",
        status: "dead",
        birthYear: 1808,
        birthPlace: "Raleigh, North Carolina",
        parents: "Mary (McDonough) Johnson and Jacob Johnson",
        deathYear: 1875,
        deathPlace: "Elizabethton, Tennessee",
        deathReason: "Stroke",
        presidencyStart: 1865,
        presidencyEnd: 1869,
        keyPolicies: 10,
        policies: [
          "Emancipation Proclamation (1863) : Declared all enslaved people in Confederate-held territories to be free, shifting the Civil War's focus to ending slavery.",
          "Homestead Act (1862) : Provided 160 acres of free public land to settlers who agreed to cultivate it for at least five years, promoting westward expansion.",
          "Pacific Railway Act (1862) : Authorized the construction of the Transcontinental Railroad, connecting the east and west coasts and boosting economic growth.",
          "Morrill Land-Grant Act (1862) : Granted federal land to states to establish agricultural and technical colleges, improving education and innovation.",
          "National Banking Act (1863) : Established a national banking system and uniform currency, stabilizing the U.S. economy during the Civil War.",
          "Suspension of Habeas Corpus (1861) : Temporarily suspended habeas corpus to arrest and detain suspected Confederate sympathizers without trial, increasing executive power.",
          "Ten-Percent Plan (1863) : Proposed a lenient Reconstruction policy that allowed Confederate states to rejoin the Union if 10% of voters swore loyalty to the U.S.",
          "13th Amendment (1865) : Pushed for the constitutional amendment that abolished slavery in the United States, ensuring a permanent end to the institution.",
          "Revenue Act of 1862 : Established the first progressive income tax to fund the Union war effort during the Civil War.",
          "Establishment of the U.S. Secret Service (1865) : Created the Secret Service on the day of his assassination, originally to combat counterfeiting but later expanded to protect the president.",
        ],
        party: "National Union",
        spouse: "Eliza McCardle Johnson",
        children: "5",
        occupationBeforePresidency: "Tailor and Politician",
        quote: "Honest conviction is my courage; the Constitution is my guide.",
      },
      {
        name: "Ulysses S. Grant",
        terms: 2,
        status: "dead",
        birthYear: 1822,
        birthPlace: "Point Pleasant, Ohio",
        parents: "Jesse Grant and Hannah Simpson",
        deathYear: 1885,
        deathPlace: "Wilton, New York",
        deathReason: "Cancer of the throat",
        presidencyStart: 1869,
        presidencyEnd: 1877,
        keyPolicies: 12,
        policies: [
          "15th Amendment (1870) : Ensured voting rights for African American men by prohibiting racial discrimination in voting.",
          "Enforcement Acts (1870-1871) : Passed laws to combat the Ku Klux Klan and protect African Americans' civil rights in the South during Reconstruction.",
          "Civil Rights Act of 1875 : Prohibited racial discrimination in public accommodations, though later struck down by the Supreme Court.",
          "Panic of 1873 : Responded to an economic depression caused by over-speculation in railroads and banking failures, leading to financial hardship across the U.S.",
          "Resumption Act of 1875 : Established the plan to return the U.S. to the gold standard, ensuring the redemption of paper currency in gold.",
          "Indian Peace Policy (1869) : Aimed to assimilate Native Americans into American society while reducing military conflicts, though it resulted in forced relocation and cultural suppression.",
          "Battle of Little Bighorn Aftermath (1876) : Oversaw federal responses to conflicts with Native American tribes, particularly after Custer’s defeat in Montana.",
          "Alabama Claims Settlement (1871) : Negotiated a treaty with Britain, securing $15.5 million in damages for British-built Confederate ships during the Civil War.",
          "Annexation of Santo Domingo Attempt (1869) : Attempted to annex Santo Domingo (now the Dominican Republic) to expand U.S. influence, though it was rejected by Congress.",
          "Reform of the Civil Service : Implemented early civil service reforms by introducing merit-based appointments and reducing the spoils system.",
          "Whiskey Ring Scandal (1875) : Exposed a major tax fraud scheme involving government officials and distillers, leading to criminal prosecutions.",
          "Transcontinental Railroad Completion (1869) : Promoted the continued expansion of railroads, linking the East and West coasts and fostering economic growth.",
        ],
        party: "Republican",
        spouse: "Julia Dent Grant",
        children: "4",
        occupationBeforePresidency: "Military Leader",
        quote: "The friend in my adversity I shall always cherish most.",
      },
      {
        name: "Rutherford B. Hayes",
        status: "dead",
        birthYear: 1822,
        birthPlace: "Delaware, Ohio",
        parents: "Rutherford Hayes Sr. and Sophia Birchard",
        deathYear: 1893,
        deathPlace: "Fremont, Ohio",
        deathReason: "Heart failure",
        presidencyStart: 1877,
        presidencyEnd: 1881,
        keyPolicies: 8,
        policies: [
          "Compromise of 1877 : Agreed to withdraw federal troops from the South in exchange for winning the disputed 1876 election, effectively ending Reconstruction.",
          "End of Reconstruction (1877) : Removed federal troops from Southern states, leading to the rise of Jim Crow laws and the disenfranchisement of African Americans.",
          "Civil Service Reform : Began reforming government jobs by pushing for merit-based appointments instead of political patronage (spoils system).",
          "Great Railroad Strike of 1877 : Sent federal troops to break up the nationwide railroad strike, marking one of the first major labor conflicts in U.S. history.",
          "Bland-Allison Act (1878) : Allowed the U.S. Treasury to purchase silver and coin it into dollars, aiming to help farmers and debtors but with limited economic impact.",
          "Indian Policy Reform : Advocated for Native American assimilation policies, including English-language education and land allotment programs.",
          "Voting Rights Protection : Urged Congress to protect Black voting rights in the South, though with little success due to Democratic opposition.",
          "Expansion of Education : Promoted federal aid for universal education, particularly in the South, but failed to pass significant legislation.",
        ],
        party: "Republican",
        spouse: "Lucy Webb Hayes",
        children: "8",
        occupationBeforePresidency: "Lawyer and Politician",
        quote: "He serves his party best who serves the country best.",
      },
      {
        name: "James A. Garfield",
        status: "dead",
        birthYear: 1831,
        birthPlace: "Moreland Hills, Ohio",
        parents: "Abigail (Ballou) Garfield and Eliza (Tanner) Garfield",
        deathYear: 1881,
        deathPlace: "Elberon, New Jersey",
        deathReason: "Assassination",
        presidencyStart: 1881,
        presidencyEnd: 1881,
        keyPolicies: 8,
        policies: [
          "Civil Service Reform Advocacy : Pushed for merit-based government jobs and opposed the spoils system, laying the groundwork for future reforms.",
          "Pendleton Civil Service Reform Act Proposal : Although passed after his assassination, his efforts led to the law, which introduced merit-based hiring for federal jobs.",
          "Strengthening Presidential Authority : Asserted executive power by resisting pressure from party leaders and refusing to grant patronage positions to political allies.",
          "Naval Expansion Plans : Advocated for modernizing and expanding the U.S. Navy to improve national defense and trade security.",
          "Support for Universal Education : Called for increased federal funding for public schools, particularly in the South, to reduce illiteracy and economic disparity.",
          "African American Civil Rights Support : Pushed for stronger federal protections for Black Americans' voting rights, though Congress did not act on his proposals.",
          "Tariff Reform : Sought to reduce tariffs that benefited industrialists at the expense of consumers, but his plans remained unfulfilled due to his short presidency.",
          "Economic Modernization : Supported industrial growth and infrastructure improvements, including railroad expansion, to boost the economy.",
        ],
        party: "Republican",
        spouse: "Lucretia Rudolph Garfield",
        children: "7",
        occupationBeforePresidency: "Military Leader and Politician",
        quote: "Ideas control the world.",
      },
      {
        name: "Chester A. Arthur",
        status: "dead",
        birthYear: 1829,
        birthPlace: "Fairfield, Vermont",
        parents: "William Arthur and Malvina Stone",
        deathYear: 1886,
        deathPlace: "New York City, New York",
        deathReason: "Stroke",
        presidencyStart: 1881,
        presidencyEnd: 1885,
        keyPolicies: 8,
        policies: [
          "Pendleton Civil Service Reform Act (1883) : Established the Civil Service Commission and introduced merit-based hiring, reducing the spoils system.",
          "Chinese Exclusion Act (1882) : Signed the first significant U.S. law restricting immigration, banning Chinese laborers from entering the country for ten years.",
          "Tariff Reduction Efforts : Advocated for lowering high tariffs to reduce surplus government revenue, though Congress was reluctant to act.",
          "Modernization of the U.S. Navy : Supported the expansion and modernization of the Navy by funding the construction of steel warships.",
          "Edmunds Act (1882) : Strengthened anti-polygamy laws against the Mormon Church in Utah, restricting polygamists' rights to vote and hold office.",
          "Rebuilding the Executive Mansion (White House) : Oversaw major renovations to the White House, improving its structure and furnishings.",
          "Indian Policy and Land Reform : Enforced policies aimed at assimilating Native Americans, including the idea of private land ownership through allotment.",
          "Veto of Rivers and Harbors Act (1882) : Vetoed a bill with excessive federal spending on infrastructure, arguing against wasteful government expenditures.",
        ],
        party: "Republican",
        spouse: "Ellen Lewis Herndon Arthur",
        children: "3",
        occupationBeforePresidency: "Lawyer",
        quote:
          "Men may die, but the fabric of our free institutions remains unshaken.",
      },
      {
        name: "Grover Cleveland",
        status: "dead",
        birthYear: 1837,
        birthPlace: "Caldwell, New Jersey",
        parents: "Richard Falley Cleveland and Ann Neal Cleveland",
        deathYear: 1908,
        deathPlace: "Princeton, New Jersey",
        deathReason: "Heart failure",
        presidencyStart: 1885,
        presidencyEnd: 1889,
        keyPolicies: 16,
        policies: [
          "Interstate Commerce Act (1887) : Established the Interstate Commerce Commission (ICC) to regulate railroad rates and prevent unfair business practices.",
          "Veto of Pension Bills : Rejected numerous Civil War veteran pension bills that he believed were fraudulent or excessive, promoting fiscal responsibility.",
          "Dawes Act (1887) : Supported legislation that aimed to assimilate Native Americans by allotting them individual landholdings, ultimately leading to the loss of tribal lands.",
          "Presidential Vetoes (Over 300 Vetoes) : Used his veto power extensively to block unnecessary federal spending, especially on private pension bills.",
          "Civil Service Reform Enforcement : Continued enforcing the Pendleton Civil Service Act by expanding merit-based government hiring and reducing political patronage.",
          "Investigation of Railroad Land Grants : Ordered the return of millions of acres of land given to railroads that failed to meet government conditions.",
          "Opposition to High Tariffs : Pushed for **lower tariffs** on imported goods, arguing that high duties benefited big businesses at the expense of consumers.",
          "Naval Expansion : Modernized and expanded the U.S. Navy, continuing the transition from wooden ships to steel warships.",
          "Pullman Strike Response (1894) : Sent federal troops to break up a nationwide railroad strike, citing the need to protect mail delivery and interstate commerce.",
          "Panic of 1893 Response : Opposed government intervention in the economy and repealed the Sherman Silver Purchase Act, worsening the Depression for farmers and workers.",
          "Gold Standard Commitment : Opposed the free coinage of silver and maintained the U.S. commitment to the gold standard to ensure financial stability.",
          "Repeal of the Sherman Silver Purchase Act (1893) : Ended the requirement for the government to purchase silver, aiming to stabilize the economy during the Panic of 1893.",
          "Wilson-Gorman Tariff Act (1894) : Attempted to reduce tariffs, but Congress added a controversial income tax provision, later ruled unconstitutional.",
          "Opposition to Imperialism : Rejected the annexation of Hawaii after American businessmen overthrew the Hawaiian monarchy, arguing that it was an unjust act.",
          "Civil Service Reform Expansion : Continued his fight against political corruption by further strengthening merit-based government hiring.",
          "Labor Rights & Anti-Union Stance : Opposed government favoritism toward labor unions and used federal power against strikes.",
        ],

        party: "Democratic",
        spouse: "Frances Folsom Cleveland",
        children: "5",
        occupationBeforePresidency: "Lawyer and Politician",
        quote:
          "A government for the people must depend for its success on the intelligence, the morality, the justice, and the interest of the people themselves.",
      },
      {
        name: "Benjamin Harrison",
        status: "dead",
        birthYear: 1833,
        birthPlace: "North Bend, Ohio",
        parents: "John Scott Harrison and Elizabeth Ramsey Irwin",
        deathYear: 1901,
        deathPlace: "Indianapolis, Indiana",
        deathReason: "Pneumonia",
        presidencyStart: 1889,
        presidencyEnd: 1893,
        keyPolicies: 8,
        policies: [
          "Sherman Antitrust Act (1890) : First federal law to prevent monopolies and anti-competitive business practices, laying the foundation for future antitrust regulations.",
          "McKinley Tariff (1890) : Raised tariffs on imported goods to protect American industries, but it also increased consumer prices and was unpopular among farmers.",
          "Dependent and Disability Pension Act (1890) : Expanded pensions for Civil War veterans and their families, significantly increasing federal spending.",
          "Sherman Silver Purchase Act (1890) : Required the U.S. government to buy more silver to boost the economy, but it contributed to economic instability.",
          "Admission of Six New States (1889-1890) : Oversaw the addition of North Dakota, South Dakota, Montana, Washington, Idaho, and Wyoming to the Union.",
          "Foreign Policy Expansion : Strengthened the U.S. Navy and promoted American influence in Latin America and the Pacific.",
          "Battle for Voting Rights : Advocated for federal protection of African American voting rights in the South, though Congress failed to pass meaningful legislation.",
          "Electricity Installed in the White House (1891) : Introduced electric lighting to the White House, though Harrison and his wife were reportedly afraid of using the light switches.",
        ],
        party: "Republican",
        spouse: "Caroline Lavinia Scott Harrison",
        children: "1",
        occupationBeforePresidency: "Lawyer and Politician",
        quote: "Great lives never go out; they go on.",
      },
      {
        name: "William McKinley",
        status: "dead",
        birthYear: 1843,
        birthPlace: "Niles, Ohio",
        parents: "William McKinley Sr. and Nancy Allison McKinley",
        deathYear: 1901,
        deathPlace: "Buffalo, New York",
        deathReason: "Assassination",
        presidencyStart: 1897,
        presidencyEnd: 1901,
        keyPolicies: 11,
        policies: [
          "Dingley Tariff Act (1897) : Raised tariffs to protect American industries, making it one of the highest tariff rates in U.S. history.",
          "Gold Standard Act (1900) : Officially put the U.S. on the gold standard, stabilizing the currency and ending the free silver debate.",
          "Annexation of Hawaii (1898) : Brought Hawaii into the U.S. as a territory, expanding American influence in the Pacific.",
          "Spanish-American War (1898) : Led the U.S. to victory against Spain, resulting in territorial acquisitions in the Caribbean and Pacific.",
          "Treaty of Paris (1898) : Ended the Spanish-American War, giving the U.S. control over Puerto Rico, Guam, and the Philippines.",
          "Platt Amendment (1901) : Established U.S. control over Cuba's foreign policy and military affairs, making Cuba a protectorate.",
          "Open Door Policy (1899-1900) : Promoted equal trade access to China for all foreign nations, protecting American economic interests.",
          "Philippine-American War (1899-1902) : Fought Filipino resistance after the U.S. took control of the Philippines, leading to prolonged conflict.",
          "Expansion of the U.S. Navy : Strengthened the Navy to support American imperialism and global trade interests.",
          "Civil Service Expansion : Continued merit-based reforms to reduce political corruption in government appointments.",
          "Industrial Growth Support : Backed policies favoring business expansion, technological advancements, and economic prosperity.",
        ],

        party: "Republican",
        spouse: "Ida Saxton McKinley",
        children: "2",
        occupationBeforePresidency: "Military Officer and Politician",
        quote:
          "The mission of the United States is one of benevolent assimilation.",
      },
      {
        name: "Theodore Roosevelt",
        terms: 2,
        status: "dead",
        birthYear: 1858,
        birthPlace: "New York City, New York",
        parents: "Theodore Roosevelt Sr. and Martha Bulloch Roosevelt",
        deathYear: 1919,
        deathPlace: "Oyster Bay, New York",
        deathReason: "Heart attack",
        presidencyStart: 1901,
        presidencyEnd: 1909,
        keyPolicies: 13,
        policies: [
          "Square Deal (1901-1909) : Aimed at balancing the interests of business, consumers, and labor by promoting fair government intervention.",
          "Antitrust Actions (1902-1906) : Enforced the Sherman Antitrust Act aggressively, breaking up monopolies like the Northern Securities Company.",
          "Hepburn Act (1906) : Strengthened the Interstate Commerce Commission (ICC) to regulate railroad rates and prevent unfair pricing practices.",
          "Pure Food and Drug Act (1906) : Laid the foundation for the FDA by requiring accurate labeling and banning harmful substances in food and medicine.",
          "Meat Inspection Act (1906) : Mandated federal inspection of meatpacking plants, improving food safety and sanitation.",
          "Conservation Movement : Established five national parks, 18 national monuments, and over 100 million acres of protected forests.",
          "Newlands Reclamation Act (1902) : Funded irrigation projects in the western U.S. to support agriculture and settlement.",
          "Roosevelt Corollary (1904) : Expanded the Monroe Doctrine, stating that the U.S. could intervene in Latin America to maintain stability.",
          "Panama Canal Project (1903) : Negotiated control of the Panama Canal Zone, allowing the U.S. to build the canal and improve global trade routes.",
          "Great White Fleet (1907-1909) : Sent the U.S. Navy on a world tour to showcase American naval power and diplomacy.",
          "Anthracite Coal Strike Mediation (1902) : Intervened in a major coal strike, forcing negotiations between workers and mine owners, setting a precedent for government involvement in labor disputes.",
          "Gentlemen’s Agreement with Japan (1907) : Limited Japanese immigration to the U.S. while improving diplomatic relations with Japan.",
          "Employer Liability Act (1906) : Provided compensation for workers injured in hazardous jobs, an early step toward workers’ rights protection.",
        ],
        party: "Republican",
        spouse: "Edith Kermit Carow Roosevelt",
        children: "6",
        occupationBeforePresidency: "Military Leader and Politician",
        quote: "Do what you can, with what you have, where you are.",
      },
      {
        name: "William Howard Taft",
        status: "dead",
        birthYear: 1857,
        birthPlace: "Cincinnati, Ohio",
        parents: "Alphonso Taft and Louise Torrey Taft",
        deathYear: 1930,
        deathPlace: "Washington, D.C.",
        deathReason: "Heart attack",
        presidencyStart: 1909,
        presidencyEnd: 1913,
        keyPolicies: 12,
        policies: [
          "Payne-Aldrich Tariff Act (1909) : Raised some tariffs instead of lowering them as promised, causing controversy and splitting the Republican Party.",
          "Mann-Elkins Act (1910) : Strengthened the Interstate Commerce Commission (ICC) by allowing it to regulate telephone, telegraph, and railroad rates.",
          "Trust-Busting Policies : Filed **more antitrust lawsuits** than Roosevelt, breaking up monopolies like Standard Oil and American Tobacco.",
          "16th Amendment (1913) : Supported the constitutional amendment allowing Congress to collect a federal income tax.",
          "17th Amendment (1913) : Advocated for the direct election of U.S. Senators, increasing democracy and reducing political corruption.",
          "Ballinger-Pinchot Controversy (1909-1910) : Fired Gifford Pinchot, Roosevelt’s conservationist ally, for criticizing his administration’s land policies, weakening conservation efforts.",
          "Arizona and New Mexico Statehood (1912) : Oversaw the admission of Arizona and New Mexico as the 47th and 48th U.S. states.",
          "Children’s Bureau Creation (1912) : Established a federal agency to investigate and improve child labor conditions, child health, and welfare.",
          "Dollar Diplomacy (1909-1913) : Used economic influence rather than military force to expand U.S. interests in Latin America and Asia.",
          "Postal Savings System (1910) : Created a federal banking system that allowed people to deposit money in post offices, promoting financial stability for small savers.",
          "Department of Labor Established (1913) : Pushed for a separate federal department to oversee labor issues, which was later created after his presidency.",
          "Expansion of U.S. Territories : Strengthened American control over the **Philippines, Puerto Rico, and Panama** through diplomatic and economic policies.",
        ],
        party: "Republican",
        spouse: "Helen Herron Taft",
        children: "3",
        occupationBeforePresidency: "Judge and Politician",
        quote: "Presidents come and go, but the Supreme Court goes on forever.",
      },
      {
        name: "Woodrow Wilson",
        terms: 2,
        status: "dead",
        birthYear: 1856,
        birthPlace: "Staunton, Virginia",
        parents: "Joseph Ruggles Wilson and Jessie Woodrow Wilson",
        deathYear: 1924,
        deathPlace: "Washington, D.C.",
        deathReason: "Stroke",
        presidencyStart: 1913,
        presidencyEnd: 1921,
        keyPolicies: 17,
        policies: [
          "Underwood Tariff Act (1913) : Lowered tariffs to promote free trade and reduce costs for consumers, replacing lost revenue with the new income tax.",
          "Federal Reserve Act (1913) : Created the Federal Reserve System to stabilize the banking industry and regulate the U.S. economy.",
          "Clayton Antitrust Act (1914) : Strengthened antitrust laws by prohibiting monopolistic practices and protecting labor unions from being targeted under antitrust laws.",
          "Federal Trade Commission Act (1914) : Established the Federal Trade Commission (FTC) to prevent unfair business practices and protect consumers.",
          "16th Amendment (1913) : Allowed the federal government to levy an income tax, creating a new revenue stream for the U.S.",
          "17th Amendment (1913) : Established the direct election of U.S. Senators, increasing democracy and reducing political corruption.",
          "18th Amendment (1919) : Pushed for prohibition, banning the production, sale, and transport of alcohol in the U.S.",
          "19th Amendment Advocacy (1918-1919) : Supported women's suffrage, leading to the passage of the 19th Amendment, which granted women the right to vote (ratified in 1920).",
          "World War I Leadership (1917-1918) : Led the U.S. into World War I after initially trying to keep the nation neutral.",
          "Selective Service Act (1917) : Instituted the military draft to build up U.S. forces for World War I.",
          "Espionage Act (1917) : Criminalized anti-war activities, making it illegal to interfere with the draft or military operations.",
          "Sedition Act (1918) : Further restricted free speech by making it illegal to criticize the government or war effort, later repealed.",
          "Fourteen Points (1918) : Outlined a vision for world peace after World War I, including the creation of the League of Nations.",
          "Treaty of Versailles (1919) : Helped negotiate the peace treaty that ended World War I, imposing strict penalties on Germany.",
          "League of Nations Proposal (1920) : Advocated for a global peacekeeping organization, though the U.S. Senate refused to join.",
          "Railway Administration Act (1917) : Temporarily nationalized the railroad industry to improve war logistics and efficiency.",
          "19th Amendment Ratification (1920) : Ensured the final passage of the women's right to vote, a significant victory for suffrage activists.",
        ],
        party: "Democratic",
        spouse: "Ellen Louise Axson Wilson",
        children: "3",
        occupationBeforePresidency: "Politician and Academic",
        quote: "The history of liberty is a history of resistance.",
      },
      {
        name: "Warren G. Harding",
        status: "dead",
        birthYear: 1865,
        birthPlace: "Blooming Grove, Ohio",
        parents: "George Tryon Harding and Phoebe Dickerson Harding",
        deathYear: 1923,
        deathPlace: "San Francisco, California",
        deathReason: "Heart attack",
        presidencyStart: 1921,
        presidencyEnd: 1923,
        keyPolicies: 10,
        policies: [
          "Emergency Quota Act (1921) : Established the first immigration restrictions in U.S. history, limiting the number of immigrants from certain countries.",
          "Revenue Act of 1921 : Reduced income tax rates, especially for the wealthy, as part of Harding’s pro-business economic policies.",
          "Budget and Accounting Act (1921) : Created the Bureau of the Budget and required the president to submit an annual budget to Congress, improving government financial management.",
          "Fordney-McCumber Tariff (1922) : Raised tariffs to protect American industries, but it also made foreign goods more expensive and harmed international trade.",
          "Washington Naval Conference (1921-1922) : Led an international effort to reduce naval armaments and prevent future conflicts among major powers.",
          "Veterans Bureau Creation (1921) : Established a government agency to assist World War I veterans with healthcare and benefits.",
          "Teapot Dome Scandal (1921-1923) : A major corruption scandal involving illegal leasing of government oil reserves, damaging Harding’s legacy.",
          "Opposition to League of Nations : Continued the U.S. policy of isolationism by rejecting involvement in the League of Nations.",
          "Civil Rights Speech in Alabama (1921) : Became the first sitting president to publicly call for equal rights for African Americans in the South, though no major legislation followed.",
          "Anti-Lynching Bill Support : Pushed for anti-lynching legislation, but Congress failed to pass it due to Southern opposition.",
        ],
        party: "Republican",
        spouse: "Florence Kling Harding",
        children: "1",
        occupationBeforePresidency: "Newspaper Publisher",
        quote: "America’s present need is not heroics but healing.",
      },
      {
        name: "Calvin Coolidge",
        status: "dead",
        birthYear: 1872,
        birthPlace: "Plymouth Notch, Vermont",
        parents: "John Calvin Coolidge Sr. and Victoria Josephine Moor Coolidge",
        deathYear: 1933,
        deathPlace: "Northampton, Massachusetts",
        deathReason: "Heart attack",
        presidencyStart: 1923,
        presidencyEnd: 1929,
        keyPolicies: 10,
        policies: [
          "Revenue Acts of 1924 and 1926 : Lowered income tax rates, especially for the wealthy, as part of his pro-business, limited-government approach.",
          "Immigration Act of 1924 : Drastically reduced immigration, especially from Southern and Eastern Europe, and **completely banned immigration from Asia.**",
          "Kellogg-Briand Pact (1928) : Signed an international agreement renouncing war as a tool for national policy, though it had little enforcement power.",
          "Dawes Plan (1924) : Helped restructure Germany’s World War I reparations, stabilizing the European economy and preventing another crisis.",
          "Laissez-Faire Economic Policies : Advocated for minimal government intervention in the economy, allowing businesses to operate freely.",
          "Expansion of the Federal Radio Commission (1927) : Regulated airwaves to bring order to the growing radio industry.",
          "Opposition to Farm Relief Bills : Vetoed the **McNary-Haugen Farm Relief Bill** twice, refusing federal price support for struggling farmers.",
          "Great Mississippi Flood Response (1927) : Provided limited federal aid after the devastating flood but resisted direct government intervention.",
          "Civil Rights Efforts : Supported anti-lynching laws and spoke out against the Ku Klux Klan, but no major legislation was passed.",
          "Continued Isolationist Foreign Policy : Avoided military entanglements and focused on economic diplomacy instead.",
        ],
        party: "Republican",
        spouse: "Grace Anna Goodhue Coolidge",
        children: "2",
        occupationBeforePresidency: "Lawyer and Politician",
        quote: "The business of America is business.",
      },
      {
        name: "Herbert Hoover",
        status: "dead",
        birthYear: 1874,
        birthPlace: "West Branch, Iowa",
        parents: "Jesse Hoover and Hulda Minerva Hoover",
        deathYear: 1964,
        deathPlace: "New York City, New York",
        deathReason: "Heart attack",
        presidencyStart: 1929,
        presidencyEnd: 1933,
        keyPolicies: 10,
        policies: [
          "Stock Market Crash Response (1929) : Urged businesses to maintain wages and employment after the stock market collapse, but avoided direct government intervention.",
          "Smoot-Hawley Tariff Act (1930) : Raised tariffs on imported goods to protect American industries, but worsened the Great Depression by reducing international trade.",
          "Reconstruction Finance Corporation (1932) : Provided emergency loans to banks, railroads, and other businesses to stabilize the economy during the Great Depression.",
          "Federal Home Loan Bank Act (1932) : Established a system of banks to provide low-interest loans for homeowners to prevent foreclosures.",
          "Public Works Programs : Increased federal spending on infrastructure projects like the **Hoover Dam** to create jobs and stimulate the economy.",
          "Opposition to Direct Relief : Rejected direct federal aid to individuals, believing in 'rugged individualism' and local charity support instead.",
          "Bonus Army Crackdown (1932) : Ordered the removal of World War I veterans protesting in Washington for early bonus payments, leading to a violent clash with federal troops.",
          "National Credit Corporation (1931) : Encouraged large banks to lend money to smaller struggling banks to prevent widespread banking failures.",
          "Mexican Repatriation Program : Oversaw mass deportations of Mexican-Americans and Mexican immigrants during the Great Depression to free up jobs for white workers.",
          "Revenue Act of 1932 : Increased taxes on corporations and individuals, worsening the economic downturn instead of helping recovery.",
        ],
        party: "Republican",
        spouse: "Lou Henry Hoover",
        children: "2",
        occupationBeforePresidency: "Engineer and Politician",
        quote: "Blessed are the young, for they shall inherit the national debt.",
      },
      {
        name: "Franklin D. Roosevelt",
        terms: 2,
        status: "dead",
        birthYear: 1882,
        birthPlace: "Hyde Park, New York",
        parents: "James Roosevelt I and Sara Delano Roosevelt",
        deathYear: 1945,
        deathPlace: "Warm Springs, Georgia",
        deathReason: "Cerebral hemorrhage",
        presidencyStart: 1933,
        presidencyEnd: 1945,
        keyPolicies: 17,
        policies: [
          "New Deal (1933-1939) : A series of programs and reforms designed to combat the Great Depression by providing economic relief, recovery, and reform.",
          "Emergency Banking Act (1933) : Closed all banks for four days to prevent panic, then reopened only those deemed financially stable.",
          "Glass-Steagall Act (1933) : Separated commercial and investment banking to prevent financial speculation, also established the Federal Deposit Insurance Corporation (FDIC).",
          "Civilian Conservation Corps (CCC) (1933) : Created jobs for young men in conservation projects like planting trees and building parks.",
          "Tennessee Valley Authority (TVA) (1933) : Built dams and hydroelectric plants in the Tennessee Valley to provide electricity and jobs.",
          "Agricultural Adjustment Act (AAA) (1933) : Paid farmers to reduce crop production to stabilize agricultural prices.",
          "National Industrial Recovery Act (NIRA) (1933) : Established industry-wide regulations to control wages, prices, and working conditions.",
          "Social Security Act (1935) : Created unemployment insurance, pensions for the elderly, and aid for the disabled, laying the foundation for the modern welfare system.",
          "Wagner Act (1935) : Strengthened workers' rights by guaranteeing unions the right to collectively bargain.",
          "Fair Labor Standards Act (1938) : Established the first federal minimum wage, maximum work hours, and restrictions on child labor.",
          "Neutrality Acts (1935-1939) : Passed a series of laws to prevent U.S. involvement in foreign wars by limiting arms sales and loans to warring nations.",
          "Lend-Lease Act (1941) : Allowed the U.S. to provide military aid to Allied nations during World War II, marking the end of strict neutrality.",
          "Pearl Harbor Response & U.S. Entry into World War II (1941) : Led the nation into World War II after the Japanese attack on Pearl Harbor.",
          "Executive Order 9066 (1942) : Authorized the internment of Japanese Americans during World War II, a highly controversial policy.",
          "Manhattan Project (1942-1945) : Secretly developed the atomic bomb, which later played a role in ending the war.",
          "G.I. Bill (1944) : Provided education and housing benefits to returning World War II veterans, helping boost the post-war economy.",
          "Yalta Conference (1945) : Negotiated post-war plans with Allied leaders, setting the stage for the Cold War.",
        ],
        party: "Democratic",
        spouse: "Eleanor Roosevelt",
        children: "6",
        occupationBeforePresidency: "Politician and Lawyer",
        quote: "The only thing we have to fear is fear itself.",
      },
      {
        name: "Harry S. Truman",
        status: "dead",
        birthYear: 1884,
        birthPlace: "Lamar, Missouri",
        parents: "John Anderson Truman and Martha Ellen Young Truman",
        deathYear: 1972,
        deathPlace: "Kansas City, Missouri",
        deathReason: "Heart failure",
        presidencyStart: 1945,
        presidencyEnd: 1953,
        keyPolicies: 13,
        policies: [
          "Truman Doctrine (1947) : Established the U.S. policy of containing communism by providing military and economic aid to countries resisting Soviet influence, starting with Greece and Turkey.",
          "Marshall Plan (1948) : Provided over $13 billion in economic aid to rebuild Western Europe after World War II, preventing the spread of communism.",
          "Berlin Airlift (1948-1949) : Ordered the U.S. to supply West Berlin with food and fuel by air when the Soviet Union blockaded the city.",
          "Creation of NATO (1949) : Helped establish the North Atlantic Treaty Organization, a military alliance aimed at countering Soviet expansion.",
          "Recognition of Israel (1948) : Became the first world leader to recognize the newly established state of Israel, shaping U.S.-Middle East relations.",
          "Fair Deal (1949) : Proposed expanding New Deal programs with national health insurance, housing assistance, and civil rights protections (though Congress rejected many parts).",
          "Executive Order 9981 (1948) : Desegregated the U.S. military, making it one of the first federal institutions to end racial segregation.",
          "Korean War (1950-1953) : Sent U.S. forces to defend South Korea against a communist invasion from North Korea, marking the first military conflict of the Cold War.",
          "Employment Act of 1946 : Committed the federal government to promoting maximum employment and economic growth.",
          "Housing Act of 1949 : Funded public housing projects to address post-war housing shortages.",
          "Atomic Energy Act (1946) : Established civilian control over nuclear energy and promoted peaceful uses of atomic power.",
          "McCarran Act (1950) : Increased restrictions on suspected communist organizations during the Red Scare, though Truman opposed it.",
          "22nd Amendment Ratification (1951) : Limited U.S. presidents to two terms, a reaction to Franklin D. Roosevelt’s four-term presidency.",
        ],
        party: "Democratic",
        spouse: "Bess Wallace Truman",
        children: "1",
        occupationBeforePresidency: "Politician and Farmer",
        quote: "The buck stops here.",
      },
      {
        name: "Dwight D. Eisenhower",
        terms: 2,
        status: "dead",
        birthYear: 1890,
        birthPlace: "Denison, Texas",
        parents: "David Jacob Eisenhower and Ida Elizabeth Stover Eisenhower",
        deathYear: 1969,
        deathPlace: "Washington, D.C.",
        deathReason: "Heart failure",
        presidencyStart: 1953,
        presidencyEnd: 1961,
        keyPolicies: 14,
        policies: [
          "Interstate Highway System (1956) : Created a nationwide network of highways, improving transportation, boosting the economy, and strengthening national defense.",
          "Civil Rights Act of 1957 : First civil rights legislation since Reconstruction, aimed at protecting African American voting rights.",
          "Civil Rights Act of 1960 : Strengthened federal oversight of voter registration and penalties for obstructing voting rights.",
          "Brown v. Board of Education Enforcement (1954) : Sent federal troops to enforce school desegregation in Little Rock, Arkansas, after the Supreme Court ruling.",
          "NASA Establishment (1958) : Founded the National Aeronautics and Space Administration (NASA) to compete with the Soviet Union in the Space Race.",
          "Eisenhower Doctrine (1957) : Declared that the U.S. would provide military and economic assistance to Middle Eastern countries resisting communism.",
          "Korean War Armistice (1953) : Negotiated the end of active fighting in Korea, leading to a long-term ceasefire and division between North and South Korea.",
          "Massive Retaliation Policy (1954) : Shifted U.S. military strategy to emphasize nuclear deterrence against Soviet threats instead of conventional warfare.",
          "McCarthyism Opposition (1954) : Publicly condemned Senator Joseph McCarthy’s anti-communist witch hunts, leading to McCarthy’s downfall.",
          "Social Security Expansion (1954, 1956) : Increased benefits and coverage for millions of Americans, making Social Security more accessible.",
          "St. Lawrence Seaway (1959) : Opened up shipping routes between the U.S. and Canada, boosting trade and economic growth.",
          "National Defense Education Act (1958) : Provided federal funding for science, math, and technology education to counter Soviet advancements after the Sputnik launch.",
          "Balanced Budget and Fiscal Conservatism : Maintained economic stability by balancing the federal budget three times while promoting infrastructure growth.",
          "U-2 Spy Plane Incident (1960) : U.S. spy plane shot down over the Soviet Union, leading to increased Cold War tensions and a failed diplomatic summit.",
        ],
        party: "Republican",
        spouse: "Mamie Geneva Doud Eisenhower",
        children: "2",
        occupationBeforePresidency: "Military Leader",
        quote: "Plans are worthless, but planning is everything.",
      },
      {
        name: "John F. Kennedy",
        status: "dead",
        birthYear: 1917,
        birthPlace: "Brookline, Massachusetts",
        parents: "Joseph P. Kennedy Sr. and Rose Fitzgerald Kennedy",
        deathYear: 1963,
        deathPlace: "Dallas, Texas",
        deathReason: "Assassination",
        presidencyStart: 1961,
        presidencyEnd: 1963,
        keyPolicies: 12,
        policies: [
          "New Frontier Program (1961-1963) : Proposed domestic policies focusing on civil rights, poverty reduction, education, and space exploration.",
          "Bay of Pigs Invasion (1961) : Approved a failed CIA-backed invasion of Cuba by Cuban exiles, which strengthened Fidel Castro’s rule and embarrassed the U.S.",
          "Cuban Missile Crisis (1962) : Successfully negotiated the removal of Soviet nuclear missiles from Cuba, bringing the world to the brink of nuclear war.",
          "Peace Corps Establishment (1961) : Created a volunteer program to send Americans abroad to assist with education, healthcare, and economic development in developing nations.",
          "Alliance for Progress (1961) : Provided economic aid to Latin American countries to prevent the spread of communism and promote development.",
          "Trade Expansion Act (1962) : Reduced tariffs and encouraged international trade, especially with Western Europe.",
          "Equal Pay Act (1963) : First major law addressing gender pay inequality, requiring equal wages for men and women performing the same job.",
          "Space Race Acceleration : Set the goal of landing a man on the moon by the end of the 1960s, leading to NASA’s Apollo program.",
          "Civil Rights Advocacy : Called for stronger civil rights laws, laying the groundwork for the Civil Rights Act of 1964 (signed after his assassination).",
          "Nuclear Test Ban Treaty (1963) : Negotiated a treaty with the Soviet Union and Britain banning nuclear tests in the atmosphere, outer space, and underwater.",
          "Manpower Development and Training Act (1962) : Provided job training programs for unemployed workers to reduce poverty and boost employment.",
          "Housing Act of 1961 : Expanded federal funding for urban renewal and affordable housing projects.",
        ],
        party: "Democratic",
        spouse: "Jacqueline Bouvier Kennedy",
        children: "4",
        occupationBeforePresidency: "Politician and Author",
        quote:
          "Ask not what your country can do for you—ask what you can do for your country.",
      },
      {
        name: "Lyndon B. Johnson",
        status: "dead",
        birthYear: 1908,
        birthPlace: "Stonewall, Texas",
        parents: "Samuel Ealy Johnson Jr. and Rebekah Baines Johnson",
        deathYear: 1973,
        deathPlace: "Johnson City, Texas",
        deathReason: "Heart attack",
        presidencyStart: 1963,
        presidencyEnd: 1969,
        keyPolicies: 14,
        policies: [
          "Civil Rights Act of 1964 : Prohibited racial discrimination in public places, employment, and education, marking a major victory for the civil rights movement.",
          "Voting Rights Act of 1965 : Outlawed literacy tests and other discriminatory practices that prevented African Americans from voting.",
          "Great Society Programs (1964-1968) : A set of domestic policies aimed at eliminating poverty and racial injustice through education, healthcare, and social welfare programs.",
          "Medicare and Medicaid (1965) : Established government-funded healthcare programs for the elderly (Medicare) and low-income individuals (Medicaid).",
          "Elementary and Secondary Education Act (1965) : Provided federal funding to improve schools, especially in low-income communities.",
          "Higher Education Act (1965) : Expanded federal funding for college students through financial aid programs like Pell Grants and student loans.",
          "War on Poverty : Launched programs like Head Start, Job Corps, and food stamps to reduce poverty in the U.S.",
          "Economic Opportunity Act (1964) : Created agencies to provide job training, adult education, and small business loans to help impoverished Americans.",
          "Immigration and Nationality Act (1965) : Abolished the immigration quota system based on nationality, opening the U.S. to immigrants from Asia, Africa, and Latin America.",
          "Fair Housing Act (1968) : Prohibited discrimination in housing based on race, religion, or national origin.",
          "Public Broadcasting Act (1967) : Established the Corporation for Public Broadcasting, leading to the creation of PBS and NPR.",
          "Gun Control Act (1968) : Introduced federal regulations on the sale and possession of firearms following the assassinations of Martin Luther King Jr. and Robert Kennedy.",
          "Vietnam War Escalation : Increased U.S. military involvement in Vietnam, leading to widespread protests and controversy.",
          "Civil Rights Act of 1968 : Expanded civil rights protections, including protections against racial discrimination in housing.",
        ],
        party: "Democratic",
        spouse: "Lady Bird Johnson",
        children: "2",
        occupationBeforePresidency: "Politician and Teacher",
        quote:
          "Yesterday is not ours to recover, but tomorrow is ours to win or lose.",
      },
      {
        name: "Richard Nixon",
        status: "dead",
        birthYear: 1913,
        birthPlace: "Yorba Linda, California",
        parents: "Francis A. Nixon and Hannah Milhous Nixon",
        deathYear: 1994,
        deathPlace: "New York City, New York",
        deathReason: "Stroke",
        presidencyStart: 1969,
        presidencyEnd: 1974,
        keyPolicies: 15,
        policies: [
          "Environmental Protection Agency (EPA) (1970) : Established the EPA to enforce environmental regulations and protect natural resources.",
          "Clean Air Act (1970) : Strengthened air pollution regulations and set national standards for air quality.",
          "Endangered Species Act (1973) : Provided protections for threatened and endangered species and their habitats.",
          "Detente with Soviet Union (1969-1974) : Improved U.S.-Soviet relations through arms control agreements, including the SALT I Treaty.",
          "Opening Relations with China (1972) : Became the first U.S. president to visit Communist China, leading to improved diplomatic and trade relations.",
          "Vietnamization Policy (1969) : Gradually withdrew U.S. troops from Vietnam while increasing military aid to South Vietnam.",
          "Paris Peace Accords (1973) : Negotiated a ceasefire in Vietnam, leading to the withdrawal of U.S. forces.",
          "War on Drugs (1971) : Declared drug abuse a national emergency, leading to stricter drug laws and the creation of the Drug Enforcement Administration (DEA) in 1973.",
          "Revenue Sharing Program (1972) : Shifted federal funds to state and local governments to give them more control over spending.",
          "Occupational Safety and Health Administration (OSHA) (1971) : Created OSHA to regulate workplace safety and protect workers' rights.",
          "26th Amendment (1971) : Lowered the voting age from 21 to 18, expanding political participation for young Americans.",
          "Title IX of the Education Amendments (1972) : Prohibited gender discrimination in federally funded education programs and athletics.",
          "Wage and Price Controls (1971) : Implemented temporary wage and price controls to combat inflation and stabilize the economy.",
          "End of Bretton Woods System (1971) : Took the U.S. off the gold standard, allowing the dollar to float freely in foreign exchange markets.",
          "Watergate Scandal (1972-1974) : A political scandal involving a break-in at the Democratic National Committee headquarters, leading to Nixon’s resignation.",
        ],
        party: "Republican",
        spouse: "Pat Nixon",
        children: "2",
        occupationBeforePresidency: "Politician and Lawyer",
        quote: "The greatest honor history can bestow is the title of peacemaker.",
      },
      {
        name: "Gerald Ford",
        status: "dead",
        birthYear: 1913,
        birthPlace: "Omaha, Nebraska",
        parents: "Leslie Lynch King Sr. and Dorothy Ayer Gardner Ford",
        deathYear: 2006,
        deathPlace: "Rancho Mirage, California",
        deathReason: "Cardiovascular disease",
        presidencyStart: 1974,
        presidencyEnd: 1977,
        keyPolicies: 12,
        policies: [
          "Presidential Pardon of Richard Nixon (1974) : Granted a full pardon to former President Nixon for any crimes related to the Watergate scandal, sparking national controversy.",
          "Helsinki Accords (1975) : Signed an agreement with 34 other nations to ease Cold War tensions and promote human rights in Eastern Europe.",
          "Whip Inflation Now (WIN) Program (1974) : Launched a voluntary program to curb inflation by encouraging personal savings and reduced spending, but it had little impact.",
          "Energy Policy Initiatives : Encouraged energy conservation and the development of alternative energy sources in response to the 1973 oil crisis.",
          "Privacy Act of 1974 : Strengthened protections for personal information held by the federal government.",
          "Education for All Handicapped Children Act (1975) : Required public schools to provide equal education opportunities for children with disabilities.",
          "Expansion of Food Stamp Program : Increased funding for food assistance programs to help low-income families.",
          "Fall of Saigon & End of Vietnam War (1975) : Oversaw the evacuation of U.S. personnel and Vietnamese refugees as North Vietnam took over South Vietnam, marking the final end of the Vietnam War.",
          "Operation Babylift (1975) : Ordered the evacuation of thousands of orphaned Vietnamese children to the United States following the fall of Saigon.",
          "Tax Reduction Act of 1975 : Implemented temporary tax cuts to stimulate economic growth during a recession.",
          "New York City Bailout (1975) : Approved federal loans to prevent New York City from going bankrupt during its financial crisis.",
          "Expansion of CIA Oversight : Strengthened congressional oversight of intelligence agencies after revelations of CIA abuses in domestic surveillance.",
        ],
        party: "Republican",
        spouse: "Betty Ford",
        children: "4",
        occupationBeforePresidency: "Politician and Lawyer",
        quote:
          "A government big enough to give you everything you want is a government big enough to take from you everything you have.",
      },
      {
        name: "Jimmy Carter",
        status: "dead",
        birthYear: 1924,
        birthPlace: "Plains, Georgia",
        parents: "James Earl Carter Sr. and Lillian Gordy Carter",
        deathYear: 2024,
        deathPlace: "Plains, Georgia",
        deathReason: "Metastatic melanoma",
        presidencyStart: 1977,
        presidencyEnd: 1981,
        keyPolicies: 13,
        policies: [
          "Camp David Accords (1978) : Negotiated a peace agreement between Egypt and Israel, leading to Egypt recognizing Israel and ending hostilities between the two nations.",
          "Department of Energy Creation (1977) : Established the Department of Energy to address the energy crisis and promote alternative energy sources.",
          "National Energy Act (1978) : Implemented policies to reduce U.S. dependence on foreign oil and encourage energy conservation.",
          "Iran Hostage Crisis (1979-1981) : Faced a diplomatic crisis when Iranian militants took 52 American hostages for 444 days, significantly weakening his presidency.",
          "Panama Canal Treaties (1977) : Signed treaties to gradually transfer control of the Panama Canal from the U.S. to Panama by 1999.",
          "Deregulation of Airlines (Airline Deregulation Act, 1978) : Ended government control over airline fares and routes, increasing competition and lowering airfares.",
          "Deregulation of Trucking and Railroads (Motor Carrier Act, 1980) : Reduced government control over the transportation industry to encourage competition and efficiency.",
          "SALT II Treaty (1979) : Negotiated a nuclear arms control treaty with the Soviet Union, but it was never ratified due to the Soviet invasion of Afghanistan.",
          "Response to Soviet Invasion of Afghanistan (1979) : Imposed economic sanctions on the Soviet Union and boycotted the 1980 Moscow Olympics.",
          "Superfund Law (Comprehensive Environmental Response, Compensation, and Liability Act, 1980) : Created a fund to clean up hazardous waste sites and protect the environment.",
          "Expansion of Human Rights Policies : Made human rights a central focus of U.S. foreign policy, pressuring authoritarian governments.",
          "Appointment of Paul Volcker as Federal Reserve Chairman (1979) : Supported high interest rate policies to combat inflation, leading to economic recession but long-term stability.",
          "Civil Service Reform Act (1978) : Overhauled the federal hiring and management system to improve government efficiency.",
        ],
        party: "Democratic",
        spouse: "Rosalynn Carter",
        children: "4",
        occupationBeforePresidency: "Farmer and Politician",
        quote:
          "We must adjust to changing times and still hold to unchanging principles.",
        image: "images/JimmyCarter.png",
      },
      {
        name: "Ronald Reagan",
        terms: 2,
        status: "dead",
        birthYear: 1911,
        birthPlace: "Tampico, Illinois",
        parents: "John Reagan and Nelle Wilson Reagan",
        deathYear: 2004,
        deathPlace: "Los Angeles, California",
        deathReason: "Pneumonia due to Alzheimer's disease",
        presidencyStart: 1981,
        presidencyEnd: 1989,
        keyPolicies: 16,
        policies: [
          "Reaganomics (1981-1989) : Economic policies focused on tax cuts, deregulation, and reducing government spending to encourage growth.",
          "Economic Recovery Tax Act (1981) : Cut income tax rates across all brackets, with the highest tax rate dropping from 70% to 50%.",
          "Tax Reform Act of 1986 : Simplified the tax code, lowered corporate tax rates, and eliminated many deductions.",
          "Deregulation of Industries : Reduced federal regulations on banking, telecommunications, and transportation to promote business growth.",
          "Increased Defense Spending : Expanded the U.S. military budget significantly to counter Soviet influence during the Cold War.",
          "Strategic Defense Initiative (SDI) (1983) : Proposed a missile defense system (nicknamed 'Star Wars') to protect the U.S. from nuclear attacks.",
          "Cold War Policies & Soviet Confrontation : Took a tough stance against the USSR, calling it the 'Evil Empire' and increasing military pressure.",
          "INF Treaty (1987) : Signed the Intermediate-Range Nuclear Forces Treaty with the Soviet Union to eliminate certain nuclear weapons.",
          "War on Drugs (1980s) : Expanded anti-drug policies, increasing penalties for drug offenses and launching the 'Just Say No' campaign.",
          "Iran-Contra Affair (1986) : Controversial secret arms sale to Iran, with proceeds used to fund anti-communist rebels in Nicaragua, leading to a major scandal.",
          "Social Security Reform (1983) : Increased payroll taxes and raised the retirement age to ensure long-term Social Security stability.",
          "Immigration Reform and Control Act (1986) : Granted amnesty to nearly 3 million undocumented immigrants while tightening border security.",
          "Civil Liberties and the Conservative Movement : Shifted the Supreme Court to the right by appointing conservative justices, including Sandra Day O’Connor, the first female justice.",
          "Challenger Disaster Response (1986) : Addressed the nation after the Space Shuttle Challenger explosion, reinforcing commitment to space exploration.",
          "Savings and Loan Crisis (Late 1980s) : Deregulated financial institutions, leading to a banking crisis that required a government bailout.",
          "End of Cold War Foundations : Built diplomatic relations with Soviet leader Mikhail Gorbachev, helping lay the groundwork for the collapse of the USSR.",
        ],
        party: "Republican",
        spouse: "Nancy Davis Reagan",
        children: "2",
        occupationBeforePresidency: "Actor and Politician",
        quote: "Freedom is never more than one generation away from extinction.",
      },
      {
        name: "George H. W. Bush",
        status: "dead",
        birthYear: 1924,
        birthPlace: "Milton, Massachusetts",
        parents: "Prescott Bush and Dorothy Walker Bush",
        deathYear: 2018,
        deathPlace: "Houston, Texas",
        deathReason: "Parkinson's disease",
        presidencyStart: 1989,
        presidencyEnd: 1993,
        keyPolicies: 14,
        policies: [
          "Americans with Disabilities Act (1990) : Prohibited discrimination against individuals with disabilities in employment, public accommodations, and transportation.",
          "Clean Air Act Amendments (1990) : Strengthened environmental regulations to reduce air pollution, acid rain, and ozone depletion.",
          "Strategic Arms Reduction Treaty (START I) (1991) : Signed a nuclear arms reduction treaty with the Soviet Union to decrease both countries' nuclear arsenals.",
          "End of the Cold War (1989-1991) : Oversaw the collapse of the Soviet Union and the peaceful end of the Cold War.",
          "Persian Gulf War (1991) : Led a U.S.-coalition military operation (Operation Desert Storm) to expel Iraqi forces from Kuwait.",
          "Invasion of Panama (1989) : Ordered the removal of Panamanian dictator Manuel Noriega for drug trafficking and threats to U.S. citizens.",
          "Budget Enforcement Act (1990) : Raised taxes and implemented spending controls to reduce the federal deficit, breaking his 'no new taxes' pledge.",
          "North American Free Trade Agreement (NAFTA) Negotiations : Initiated NAFTA discussions, paving the way for free trade between the U.S., Canada, and Mexico (signed under Clinton).",
          "Immigration Act of 1990 : Increased legal immigration limits and created new visa categories for skilled workers and diversity immigrants.",
          "Education Goals 2000 Initiative : Established national education goals to improve student achievement and accountability in schools.",
          "Disaster Relief Act Expansion : Improved federal response to natural disasters, including Hurricane Andrew in 1992.",
          "Civil Rights Act of 1991 : Strengthened protections against workplace discrimination based on race, gender, and disability.",
          "Energy Policy Act (1992) : Promoted energy efficiency, renewable energy, and the development of alternative fuels.",
          "Los Angeles Riots Response (1992) : Deployed federal troops to restore order after the Rodney King verdict led to civil unrest.",
        ],
        party: "Republican",
        spouse: "Barbara Pierce Bush",
        children: "6",
        occupationBeforePresidency: "Politician and Businessman",
        quote: "We are not the sum of our possessions.",
      },
      {
        name: "Bill Clinton",
        terms: 2,
        status: "alive",
        birthYear: 1946,
        birthPlace: "Hope, Arkansas",
        parents: "William Jefferson Blythe Jr. and Virginia Dell Cassidy",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 1993,
        presidencyEnd: 2001,
        keyPolicies: 15,
        policies: [
          "North American Free Trade Agreement (NAFTA) (1993) : Signed into law a trade agreement between the U.S., Canada, and Mexico, eliminating most tariffs and boosting trade.",
          "Welfare Reform (Personal Responsibility and Work Opportunity Reconciliation Act, 1996) : Overhauled welfare programs by setting work requirements and time limits on government assistance.",
          "Balanced Budget and Economic Growth (1993-2001) : Led to a budget surplus by cutting deficits, increasing taxes on higher incomes, and growing the economy.",
          "Crime Bill (Violent Crime Control and Law Enforcement Act, 1994) : Increased police funding, expanded the death penalty, and implemented a federal 'three strikes' law.",
          "Family and Medical Leave Act (1993) : Guaranteed employees up to 12 weeks of unpaid leave for family or medical emergencies.",
          "Children’s Health Insurance Program (CHIP) (1997) : Expanded healthcare coverage for low-income children through federal and state partnerships.",
          "Defense of Marriage Act (DOMA) (1996) : Defined marriage as between a man and a woman for federal purposes, later ruled unconstitutional.",
          "Brady Handgun Violence Prevention Act (1993) : Imposed background checks and waiting periods for handgun purchases.",
          "Repeal of Glass-Steagall Act (Gramm-Leach-Bliley Act, 1999) : Removed financial regulations separating commercial and investment banks, later blamed for contributing to the 2008 financial crisis.",
          "Digital Millennium Copyright Act (DMCA) (1998) : Strengthened intellectual property protections in the digital era.",
          "Dayton Accords (1995) : Led NATO intervention in Bosnia to end the civil war and ethnic cleansing in the region.",
          "Kosovo Intervention (1999) : Ordered NATO airstrikes to stop Serbian aggression against ethnic Albanians in Kosovo.",
          "Expansion of NATO (1999) : Brought Poland, Hungary, and the Czech Republic into NATO, strengthening U.S. influence in Eastern Europe.",
          "China Trade Relations (2000) : Signed a bill granting China Permanent Normal Trade Relations (PNTR), paving the way for its entry into the World Trade Organization.",
          "Impeachment (1998-1999) : Impeached by the House of Representatives for perjury and obstruction of justice related to the Monica Lewinsky scandal but was acquitted by the Senate.",
        ],
        party: "Democratic",
        spouse: "Hillary Clinton",
        children: "1",
        occupationBeforePresidency: "Politician and Lawyer",
        quote:
          "There is nothing wrong with America that cannot be cured by what is right with America.",
      },
      {
        name: "George W. Bush",
        terms: 2,
        status: "alive",
        birthYear: 1946,
        birthPlace: "New Haven, Connecticut",
        parents: "George H. W. Bush and Barbara Bush",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2001,
        presidencyEnd: 2009,
        keyPolicies: 15,
        policies: [
          "No Child Left Behind Act (2002) : Increased federal oversight of education, requiring standardized testing and accountability measures for schools.",
          "USA PATRIOT Act (2001) : Expanded government surveillance powers to combat terrorism after the 9/11 attacks.",
          "Department of Homeland Security Creation (2002) : Established a new federal department to coordinate national security efforts against terrorism.",
          "War on Terror (2001-2009) : Launched military campaigns in Afghanistan and Iraq to combat terrorism and promote democracy.",
          "Invasion of Afghanistan (2001) : Led U.S. forces to overthrow the Taliban regime after the 9/11 attacks.",
          "Invasion of Iraq (2003) : Ordered the U.S. invasion of Iraq, leading to the overthrow of Saddam Hussein and a prolonged military presence.",
          "Medicare Prescription Drug, Improvement, and Modernization Act (2003) : Created Medicare Part D, providing prescription drug coverage for senior citizens.",
          "Bush Tax Cuts (2001, 2003) : Reduced federal income tax rates across all brackets, including significant cuts for high-income earners.",
          "Emergency Economic Stabilization Act (2008) : Approved a $700 billion bailout to rescue failing financial institutions during the 2008 financial crisis.",
          "Hurricane Katrina Response (2005) : Faced criticism for the slow and ineffective federal response to the disaster.",
          "Partial-Birth Abortion Ban Act (2003) : Prohibited a specific late-term abortion procedure, marking a major victory for pro-life advocates.",
          "Energy Policy Act (2005) : Promoted domestic energy production, including oil drilling, ethanol use, and alternative energy incentives.",
          "Financial Regulations and Housing Crisis Response (2008) : Introduced measures to stabilize the economy after the subprime mortgage collapse.",
          "Great Recession (2007-2009) : Presided over the start of the worst economic downturn since the Great Depression, leading to major government interventions.",
          "U.S. Withdrawal Plan from Iraq (2008) : Signed an agreement with Iraq setting a timeline for U.S. troop withdrawals.",
        ],
        party: "Republican",
        spouse: "Laura Welch Bush",
        children: "2",
        occupationBeforePresidency: "Governor",
        quote: "We will not tire, we will not falter, and we will not fail.",
      },
      {
        name: "Barack Obama",
        terms: 2,
        status: "alive",
        birthYear: 1961,
        birthPlace: "Honolulu, Hawaii",
        parents: "Barack Obama Sr. and Stanley Ann Dunham",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2009,
        presidencyEnd: 2017,
        keyPolicies: 16,
        policies: [
          "Affordable Care Act (Obamacare) (2010) : Expanded healthcare coverage, required insurance companies to cover pre-existing conditions, and created health insurance marketplaces.",
          "Dodd-Frank Wall Street Reform Act (2010) : Introduced financial regulations to prevent a repeat of the 2008 financial crisis by increasing oversight of banks and Wall Street.",
          "American Recovery and Reinvestment Act (2009) : Implemented a $787 billion economic stimulus package to combat the Great Recession through tax cuts, infrastructure projects, and job programs.",
          "Ending the War in Iraq (2011) : Completed the withdrawal of U.S. troops from Iraq, fulfilling a major campaign promise.",
          "Osama bin Laden Raid (2011) : Ordered the successful U.S. Navy SEAL operation that killed al-Qaeda leader Osama bin Laden.",
          "DREAM Act and DACA (2012) : Established Deferred Action for Childhood Arrivals (DACA) to protect undocumented immigrants who arrived as children from deportation.",
          "Paris Climate Agreement (2015) : Signed an international treaty committing the U.S. to reducing greenhouse gas emissions and combating climate change.",
          "Cuba-U.S. Relations Normalization (2014-2015) : Reestablished diplomatic relations with Cuba after decades of tension and trade embargoes.",
          "Iran Nuclear Deal (2015) : Negotiated an agreement to limit Iran’s nuclear program in exchange for lifting economic sanctions.",
          "Repeal of Don’t Ask, Don’t Tell (2010) : Allowed LGBTQ+ individuals to serve openly in the U.S. military.",
          "Marriage Equality Support : Appointed Supreme Court justices who contributed to the 2015 ruling legalizing same-sex marriage nationwide.",
          "Expansion of Student Loan Relief (2010-2014) : Introduced reforms to lower student loan interest rates and expand income-based repayment plans.",
          "Lilly Ledbetter Fair Pay Act (2009) : Strengthened equal pay protections for women and employees facing wage discrimination.",
          "Automotive Industry Bailout (2009) : Provided emergency funding to rescue General Motors and Chrysler, saving jobs in the auto industry.",
          "Gun Control Efforts (2013-2016) : Pushed for universal background checks and gun safety laws after mass shootings, though faced congressional opposition.",
          "Trans-Pacific Partnership (TPP) Negotiation (2016) : Negotiated a major trade deal with Pacific nations to counter China’s influence, though it was later scrapped under Trump.",
        ],
        party: "Democratic",
        spouse: "Michelle Obama",
        children: "2",
        occupationBeforePresidency: "Politician and Lawyer",
        quote: "Yes we can.",
      },
      {
        name: "Donald Trump",
        status: "alive",
        birthYear: 1946,
        birthPlace: "Queens, New York City, New York",
        parents: "Fred Trump and Mary MacLeod Trump",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2017,
        presidencyEnd: 2021,
        keyPolicies: 8,
        policies: [
          "Tax Cuts and Jobs Act (2017) : Implemented significant tax reforms, reducing corporate tax rates and altering individual income tax brackets.",
          "Deregulation Efforts : Rolled back numerous federal regulations across various sectors to promote business growth.",
          "Immigration Policies : Enforced stricter immigration laws, including the travel ban on certain countries and attempts to end DACA.",
          "Trade Policies : Imposed tariffs on imports from China and other countries to protect American industries.",
          "Criminal Justice Reform (First Step Act, 2018) : Enacted reforms aimed at reducing recidivism and improving prison conditions.",
          "Judicial Appointments : Appointed three Supreme Court justices and numerous federal judges, shifting the judiciary to a more conservative stance.",
          "COVID-19 Response : Implemented measures to address the pandemic, including travel restrictions and Operation Warp Speed to accelerate vaccine development.",
          "Middle East Policies : Recognized Jerusalem as Israel's capital and brokered normalization agreements between Israel and several Arab nations.",
        ],
        party: "Republican",
        spouse: "Melania Trump",
        children: "5",
        occupationBeforePresidency: "Businessman and TV Personality",
        quote: "The more you dream, the farther you get.",
      },
      {
        name: "Joe Biden",
        status: "alive",
        birthYear: 1942,
        birthPlace: "Scranton, Pennsylvania",
        parents: "Joseph R. Biden Sr. and Catherine Eugenia Finnegan Biden",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2021,
        presidencyEnd: 2025,
        keyPolicies: 15,
        policies: [
          "American Rescue Plan Act (2021) : Enacted a $1.9 trillion stimulus package to address the economic impact of the COVID-19 pandemic, providing direct payments to individuals, extending unemployment benefits, and funding vaccine distribution.",
          "Infrastructure Investment and Jobs Act (2021) : Signed into law a $1 trillion bipartisan infrastructure bill to modernize transportation, utilities, and broadband infrastructure across the United States.",
          "Inflation Reduction Act (2022) : Passed legislation focusing on deficit reduction, climate change initiatives, healthcare subsidies, and tax reforms, aiming to lower greenhouse gas emissions and reduce prescription drug costs.",
          "Paris Climate Agreement Reentry (2021) : Rejoined the international accord to combat climate change, committing the U.S. to reduce greenhouse gas emissions and promote global environmental initiatives.",
          "Afghanistan Withdrawal (2021) : Ordered the complete withdrawal of U.S. troops from Afghanistan, ending America's longest war but facing criticism over the chaotic evacuation process.",
          "COVID-19 Vaccination Campaign : Launched a nationwide effort to distribute and administer vaccines, achieving significant milestones in vaccination rates to combat the pandemic.",
          "Student Loan Relief : Extended pauses on federal student loan repayments and explored forgiveness options for borrowers, aiming to alleviate financial burdens on students.",
          "Executive Actions on Racial Equity : Issued orders to address systemic racism and promote equity across federal agencies, including reforms in housing, criminal justice, and economic opportunities.",
          "Gun Control Measures : Advocated for enhanced background checks, assault weapon bans, and community violence intervention programs to address rising gun violence.",
          "Immigration Policies : Proposed comprehensive immigration reform, including pathways to citizenship for undocumented immigrants and changes to asylum procedures.",
          "Healthcare Initiatives : Strengthened the Affordable Care Act by increasing subsidies and expanding enrollment periods to improve healthcare access.",
          "Economic Policies : Implemented measures to boost job growth, support small businesses, and increase the federal minimum wage to stimulate economic recovery.",
          "Foreign Policy Shifts : Emphasized diplomacy by reengaging with allies, addressing challenges posed by China and Russia, and promoting democratic values globally.",
          "Education Funding : Increased investments in public education, proposed universal pre-K, and supported initiatives to make community college tuition-free.",
          "Climate Change Actions : Set ambitious goals for renewable energy adoption, electric vehicle promotion, and conservation efforts to address environmental concerns.",
        ],
        party: "Democratic",
        spouse: "Jill Biden",
        children: "4",
        occupationBeforePresidency: "Politician and Lawyer",
        quote: "Our best days still lie ahead.",
      },
      {
        name: "Donald Trump",
        status: "alive",
        birthYear: 1946,
        birthPlace: "Queens, New York City, New York",
        parents: "Fred Trump and Mary MacLeod Trump",
        deathYear: "",
        deathPlace: "N/A",
        deathReason: "N/A",
        presidencyStart: 2025,
        presidencyEnd: "Current President",
        keyPolicies: 3,
        policies: ["a:b", "c:d", "e:f"],
        party: "Republican",
        spouse: "Melania Trump",
        children: "5",
        occupationBeforePresidency: "Businessman and TV Personality",
        quote: "The more you dream, the farther you get.",
      },
    ]);

    /* src/components/onePresidentUnit.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$3 = "src/components/onePresidentUnit.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (57:2) {#each Array($presidents[index].policies.length).fill(0) as _, arcIndex}
    function create_each_block_1$1(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;
    	let mounted;
    	let dispose;

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[15](/*arcIndex*/ ctx[36], ...args);
    	}

    	function focus_handler() {
    		return /*focus_handler*/ ctx[17](/*arcIndex*/ ctx[36]);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[19](/*arcIndex*/ ctx[36], ...args);
    	}

    	function keydown_handler() {
    		return /*keydown_handler*/ ctx[20](/*arcIndex*/ ctx[36]);
    	}

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = calculateArcPath(/*cx*/ ctx[2], /*cy*/ ctx[3], /*outerRadius*/ ctx[5], /*arcIndex*/ ctx[36], /*$presidents*/ ctx[12][/*index*/ ctx[9]].policies.length));

    			attr_dev(path, "fill", path_fill_value = /*isActive*/ ctx[14](/*index*/ ctx[9]) && /*hoveredArc*/ ctx[10] === `${/*index*/ ctx[9]}-${/*arcIndex*/ ctx[36]}`
    			? "lightblue"
    			: "white");

    			attr_dev(path, "stroke", "black");
    			attr_dev(path, "stroke-width", "2px");
    			attr_dev(path, "class", "svelte-2dlf6z");
    			add_location(path, file$3, 58, 4, 1662);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(path, "mouseover", mouseover_handler, false, false, false, false),
    					listen_dev(path, "mouseout", /*mouseout_handler*/ ctx[16], false, false, false, false),
    					listen_dev(path, "focus", focus_handler, false, false, false, false),
    					listen_dev(path, "blur", /*blur_handler*/ ctx[18], false, false, false, false),
    					listen_dev(path, "click", click_handler, false, false, false, false),
    					listen_dev(path, "keydown", keydown_handler, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*cx, cy, outerRadius, $presidents, index*/ 4652 && path_d_value !== (path_d_value = calculateArcPath(/*cx*/ ctx[2], /*cy*/ ctx[3], /*outerRadius*/ ctx[5], /*arcIndex*/ ctx[36], /*$presidents*/ ctx[12][/*index*/ ctx[9]].policies.length))) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty[0] & /*index, hoveredArc*/ 1536 && path_fill_value !== (path_fill_value = /*isActive*/ ctx[14](/*index*/ ctx[9]) && /*hoveredArc*/ ctx[10] === `${/*index*/ ctx[9]}-${/*arcIndex*/ ctx[36]}`
    			? "lightblue"
    			: "white")) {
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(57:2) {#each Array($presidents[index].policies.length).fill(0) as _, arcIndex}",
    		ctx
    	});

    	return block;
    }

    // (152:2) {#if hoveredBirthIndex === index}
    function create_if_block_5(ctx) {
    	let text_1;
    	let tspan0;
    	let t0;
    	let t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].parents + "";
    	let t1;
    	let tspan0_x_value;
    	let t2;
    	let tspan1;
    	let t3;
    	let t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthPlace + "";
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
    			add_location(tspan0, file$3, 159, 6, 4424);
    			attr_dev(tspan1, "x", tspan1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(tspan1, "dy", "15");
    			add_location(tspan1, file$3, 162, 6, 4526);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "12px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$3, 152, 4, 4272);
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
    			if (dirty[0] & /*$presidents, index*/ 4608 && t1_value !== (t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].parents + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*cx, outerRadius*/ 36 && tspan0_x_value !== (tspan0_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan0, "x", tspan0_x_value);
    			}

    			if (dirty[0] & /*$presidents, index*/ 4608 && t4_value !== (t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthPlace + "")) set_data_dev(t4, t4_value);

    			if (dirty[0] & /*cx, outerRadius*/ 36 && tspan1_x_value !== (tspan1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan1, "x", tspan1_x_value);
    			}

    			if (dirty[0] & /*cx, outerRadius*/ 36 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(152:2) {#if hoveredBirthIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (209:2) {:else}
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
    			add_location(line, file$3, 209, 4, 5797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cx, outerRadius*/ 36 && line_x__value !== (line_x__value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && line_y__value !== (line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.45)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty[0] & /*cx, outerRadius*/ 36 && line_x__value_1 !== (line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && line_y__value_1 !== (line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.55)) {
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
    		source: "(209:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (170:2) {#if $presidents[index].status === "dead"}
    function create_if_block_3(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let text_1;
    	let t_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;
    	let mounted;
    	let dispose;
    	let if_block = /*hoveredDeathIndex*/ ctx[1] === /*index*/ ctx[9] && create_if_block_4(ctx);

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
    			add_location(circle, file$3, 170, 4, 4747);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5] + 10);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5);
    			attr_dev(text_1, "text-anchor", "start");
    			attr_dev(text_1, "font-size", "0.9rem");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$3, 199, 4, 5583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "mouseover", /*mouseover_handler_2*/ ctx[27], false, false, false, false),
    					listen_dev(circle, "mouseout", /*mouseout_handler_2*/ ctx[28], false, false, false, false),
    					listen_dev(circle, "focus", /*focus_handler_2*/ ctx[29], false, false, false, false),
    					listen_dev(circle, "blur", /*blur_handler_2*/ ctx[30], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cx, outerRadius*/ 36 && circle_cx_value !== (circle_cx_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && circle_cy_value !== (circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (/*hoveredDeathIndex*/ ctx[1] === /*index*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(text_1.parentNode, text_1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*$presidents, index*/ 4608 && t_value !== (t_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*cx, outerRadius*/ 36 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5] + 10)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5)) {
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(170:2) {#if $presidents[index].status === \\\"dead\\\"}",
    		ctx
    	});

    	return block;
    }

    // (183:4) {#if hoveredDeathIndex === index}
    function create_if_block_4(ctx) {
    	let text_1;
    	let tspan0;
    	let t0;
    	let t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathPlace + "";
    	let t1;
    	let tspan0_x_value;
    	let t2;
    	let tspan1;
    	let t3;
    	let t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathReason + "";
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
    			add_location(tspan0, file$3, 190, 8, 5342);
    			attr_dev(tspan1, "x", tspan1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(tspan1, "dy", "15");
    			add_location(tspan1, file$3, 193, 8, 5453);
    			attr_dev(text_1, "x", text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(text_1, "y", text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "12px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$3, 183, 6, 5176);
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
    			if (dirty[0] & /*$presidents, index*/ 4608 && t1_value !== (t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathPlace + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*cx, outerRadius*/ 36 && tspan0_x_value !== (tspan0_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan0, "x", tspan0_x_value);
    			}

    			if (dirty[0] & /*$presidents, index*/ 4608 && t4_value !== (t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathReason + "")) set_data_dev(t4, t4_value);

    			if (dirty[0] & /*cx, outerRadius*/ 36 && tspan1_x_value !== (tspan1_x_value = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(tspan1, "x", tspan1_x_value);
    			}

    			if (dirty[0] & /*cx, outerRadius*/ 36 && text_1_x_value !== (text_1_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && text_1_y_value !== (text_1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 25)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(183:4) {#if hoveredDeathIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (269:2) {#if $presidents[index].presidencyEnd !== "Current President"}
    function create_if_block_2(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");

    			attr_dev(circle, "cx", circle_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) / ((/*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear) - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]));

    			attr_dev(circle, "cy", circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle, "r", "4");
    			attr_dev(circle, "fill", "teal");
    			add_location(circle, file$3, 269, 4, 7144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cx, outerRadius, $presidents, index*/ 4644 && circle_cx_value !== (circle_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) / ((/*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear) - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && circle_cy_value !== (circle_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(269:2) {#if $presidents[index].presidencyEnd !== \\\"Current President\\\"}",
    		ctx
    	});

    	return block;
    }

    // (296:2) {#if $presidents[$selectedCircleId] || $presidents[$selectedCircleId]?.otherPresidents.includes($presidents[index].name)}
    function create_if_block$1(ctx) {
    	let foreignObject;
    	let div_1;
    	let div_1_id_value;
    	let foreignObject_x_value;
    	let foreignObject_y_value;
    	let foreignObject_width_value;
    	let each_value = /*$presidents*/ ctx[12][/*$selectedCircleId*/ ctx[11]]?.otherPresidentThings;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			foreignObject = svg_element("foreignObject");
    			div_1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div_1, "id", div_1_id_value = "president-" + /*index*/ ctx[9] + "-Quote");
    			set_style(div_1, "text-align", "center");
    			set_style(div_1, "font-size", "0.75rem");
    			add_location(div_1, file$3, 302, 6, 8001);
    			attr_dev(foreignObject, "x", foreignObject_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(foreignObject, "y", foreignObject_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.6);
    			attr_dev(foreignObject, "width", foreignObject_width_value = /*outerRadius*/ ctx[5] * 2);
    			attr_dev(foreignObject, "height", "90");
    			add_location(foreignObject, file$3, 296, 4, 7866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, foreignObject, anchor);
    			append_dev(foreignObject, div_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div_1, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$presidents, $selectedCircleId, index*/ 6656) {
    				each_value = /*$presidents*/ ctx[12][/*$selectedCircleId*/ ctx[11]]?.otherPresidentThings;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div_1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*index*/ 512 && div_1_id_value !== (div_1_id_value = "president-" + /*index*/ ctx[9] + "-Quote")) {
    				attr_dev(div_1, "id", div_1_id_value);
    			}

    			if (dirty[0] & /*cx, outerRadius*/ 36 && foreignObject_x_value !== (foreignObject_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(foreignObject, "x", foreignObject_x_value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && foreignObject_y_value !== (foreignObject_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.6)) {
    				attr_dev(foreignObject, "y", foreignObject_y_value);
    			}

    			if (dirty[0] & /*outerRadius*/ 32 && foreignObject_width_value !== (foreignObject_width_value = /*outerRadius*/ ctx[5] * 2)) {
    				attr_dev(foreignObject, "width", foreignObject_width_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(foreignObject);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(296:2) {#if $presidents[$selectedCircleId] || $presidents[$selectedCircleId]?.otherPresidents.includes($presidents[index].name)}",
    		ctx
    	});

    	return block;
    }

    // (308:10) {#if obj[$presidents[index].name]}
    function create_if_block_1$1(ctx) {
    	let t_value = /*obj*/ ctx[31][/*$presidents*/ ctx[12][/*index*/ ctx[9]].name] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$presidents, $selectedCircleId, index*/ 6656 && t_value !== (t_value = /*obj*/ ctx[31][/*$presidents*/ ctx[12][/*index*/ ctx[9]].name] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(308:10) {#if obj[$presidents[index].name]}",
    		ctx
    	});

    	return block;
    }

    // (307:8) {#each $presidents[$selectedCircleId]?.otherPresidentThings as obj}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*obj*/ ctx[31][/*$presidents*/ ctx[12][/*index*/ ctx[9]].name] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*obj*/ ctx[31][/*$presidents*/ ctx[12][/*index*/ ctx[9]].name]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(307:8) {#each $presidents[$selectedCircleId]?.otherPresidentThings as obj}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let g;
    	let circle0;
    	let image;
    	let image_x_value;
    	let image_y_value;
    	let image_width_value;
    	let image_height_value;
    	let image_href_value;
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
    	let t0_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].name + "";
    	let t0;
    	let text0_y_value;
    	let text1;
    	let t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyStart + "";
    	let t1;
    	let t2;
    	let t3_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd + "";
    	let t3;
    	let text1_y_value;
    	let text2;
    	let t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear + "";
    	let t4;
    	let text2_x_value;
    	let text2_y_value;
    	let circle2;
    	let circle2_cx_value;
    	let circle2_cy_value;
    	let if_block2_anchor;
    	let show_if = /*$presidents*/ ctx[12][/*$selectedCircleId*/ ctx[11]] || /*$presidents*/ ctx[12][/*$selectedCircleId*/ ctx[11]]?.otherPresidents.includes(/*$presidents*/ ctx[12][/*index*/ ctx[9]].name);
    	let g_class_value;
    	let g_opacity_value;
    	let mounted;
    	let dispose;
    	let each_value_1 = Array(/*$presidents*/ ctx[12][/*index*/ ctx[9]].policies.length).fill(0);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let if_block0 = /*hoveredBirthIndex*/ ctx[0] === /*index*/ ctx[9] && create_if_block_5(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$presidents*/ ctx[12][/*index*/ ctx[9]].status === "dead") return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd !== "Current President" && create_if_block_2(ctx);
    	let if_block3 = show_if && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			circle0 = svg_element("circle");
    			image = svg_element("image");
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
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			if (if_block3) if_block3.c();
    			attr_dev(circle0, "cx", /*cx*/ ctx[2]);
    			attr_dev(circle0, "cy", /*cy*/ ctx[3]);
    			attr_dev(circle0, "r", /*innerRadius*/ ctx[4]);
    			attr_dev(circle0, "stroke", /*stroke*/ ctx[6]);
    			attr_dev(circle0, "stroke-width", /*strokeWidth*/ ctx[7]);
    			attr_dev(circle0, "fill", /*fill*/ ctx[8]);
    			add_location(circle0, file$3, 105, 2, 3195);
    			attr_dev(image, "x", image_x_value = /*cx*/ ctx[2] - /*innerRadius*/ ctx[4]);
    			attr_dev(image, "y", image_y_value = /*cy*/ ctx[3] - /*innerRadius*/ ctx[4]);
    			attr_dev(image, "width", image_width_value = /*innerRadius*/ ctx[4] * 2);
    			attr_dev(image, "height", image_height_value = /*innerRadius*/ ctx[4] * 2);
    			attr_dev(image, "data-index", /*index*/ ctx[9]);
    			attr_dev(image, "href", image_href_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].image);
    			attr_dev(image, "clip-path", "circle(50%)");
    			attr_dev(image, "tabindex", "0");
    			attr_dev(image, "role", "button");
    			attr_dev(image, "class", "svelte-2dlf6z");
    			add_location(image, file$3, 115, 2, 3332);
    			attr_dev(line, "x1", line_x__value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(line, "y1", line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(line, "x2", line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5]);
    			attr_dev(line, "y2", line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(line, "stroke", /*stroke*/ ctx[6]);
    			attr_dev(line, "stroke-width", /*strokeWidth*/ ctx[7]);
    			add_location(line, file$3, 129, 2, 3680);
    			attr_dev(circle1, "cx", circle1_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5]);
    			attr_dev(circle1, "cy", circle1_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle1, "r", "4");
    			attr_dev(circle1, "fill", "black");
    			add_location(circle1, file$3, 139, 2, 3890);
    			attr_dev(text0, "x", /*cx*/ ctx[2]);
    			attr_dev(text0, "y", text0_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 20);
    			attr_dev(text0, "text-anchor", "middle");
    			attr_dev(text0, "font-size", "16px");
    			attr_dev(text0, "fill", "black");
    			add_location(text0, file$3, 220, 2, 6020);
    			attr_dev(text1, "x", /*cx*/ ctx[2]);
    			attr_dev(text1, "y", text1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 5);
    			attr_dev(text1, "text-anchor", "middle");
    			attr_dev(text1, "font-size", "14px");
    			attr_dev(text1, "fill", "black");
    			add_location(text1, file$3, 231, 2, 6220);
    			attr_dev(text2, "x", text2_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] - 10);
    			attr_dev(text2, "y", text2_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5);
    			attr_dev(text2, "text-anchor", "end");
    			attr_dev(text2, "font-size", "0.9rem");
    			attr_dev(text2, "fill", "black");
    			add_location(text2, file$3, 242, 2, 6463);

    			attr_dev(circle2, "cx", circle2_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyStart - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) / ((/*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear) - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]));

    			attr_dev(circle2, "cy", circle2_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5);
    			attr_dev(circle2, "r", "4");
    			attr_dev(circle2, "fill", "teal");
    			add_location(circle2, file$3, 253, 2, 6683);
    			attr_dev(g, "class", g_class_value = "circle-" + /*index*/ ctx[9]);

    			attr_dev(g, "opacity", g_opacity_value = `circle-${/*$selectedCircleId*/ ctx[11]}` === "circle-null" || `circle-${/*$selectedCircleId*/ ctx[11]}` === "circle-" + /*index*/ ctx[9] || /*$presidents*/ ctx[12][/*$selectedCircleId*/ ctx[11]]?.otherPresidents.includes(/*$presidents*/ ctx[12][/*index*/ ctx[9]].name)
    			? 1
    			: 0.4);

    			add_location(g, file$3, 46, 0, 1279);
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
    			append_dev(g, image);
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
    			if (if_block2) if_block2.m(g, null);
    			append_dev(g, if_block2_anchor);
    			if (if_block3) if_block3.m(g, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(image, "click", /*click_handler_1*/ ctx[21], false, false, false, false),
    					listen_dev(image, "keydown", /*keydown_handler_1*/ ctx[22], false, false, false, false),
    					listen_dev(circle1, "mouseover", /*mouseover_handler_1*/ ctx[23], false, false, false, false),
    					listen_dev(circle1, "mouseout", /*mouseout_handler_1*/ ctx[24], false, false, false, false),
    					listen_dev(circle1, "focus", /*focus_handler_1*/ ctx[25], false, false, false, false),
    					listen_dev(circle1, "blur", /*blur_handler_1*/ ctx[26], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cx, cy, outerRadius, $presidents, index, isActive, hoveredArc, $selectedCircleId*/ 24108) {
    				each_value_1 = Array(/*$presidents*/ ctx[12][/*index*/ ctx[9]].policies.length).fill(0);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, circle0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*cx*/ 4) {
    				attr_dev(circle0, "cx", /*cx*/ ctx[2]);
    			}

    			if (dirty[0] & /*cy*/ 8) {
    				attr_dev(circle0, "cy", /*cy*/ ctx[3]);
    			}

    			if (dirty[0] & /*innerRadius*/ 16) {
    				attr_dev(circle0, "r", /*innerRadius*/ ctx[4]);
    			}

    			if (dirty[0] & /*stroke*/ 64) {
    				attr_dev(circle0, "stroke", /*stroke*/ ctx[6]);
    			}

    			if (dirty[0] & /*strokeWidth*/ 128) {
    				attr_dev(circle0, "stroke-width", /*strokeWidth*/ ctx[7]);
    			}

    			if (dirty[0] & /*fill*/ 256) {
    				attr_dev(circle0, "fill", /*fill*/ ctx[8]);
    			}

    			if (dirty[0] & /*cx, innerRadius*/ 20 && image_x_value !== (image_x_value = /*cx*/ ctx[2] - /*innerRadius*/ ctx[4])) {
    				attr_dev(image, "x", image_x_value);
    			}

    			if (dirty[0] & /*cy, innerRadius*/ 24 && image_y_value !== (image_y_value = /*cy*/ ctx[3] - /*innerRadius*/ ctx[4])) {
    				attr_dev(image, "y", image_y_value);
    			}

    			if (dirty[0] & /*innerRadius*/ 16 && image_width_value !== (image_width_value = /*innerRadius*/ ctx[4] * 2)) {
    				attr_dev(image, "width", image_width_value);
    			}

    			if (dirty[0] & /*innerRadius*/ 16 && image_height_value !== (image_height_value = /*innerRadius*/ ctx[4] * 2)) {
    				attr_dev(image, "height", image_height_value);
    			}

    			if (dirty[0] & /*index*/ 512) {
    				attr_dev(image, "data-index", /*index*/ ctx[9]);
    			}

    			if (dirty[0] & /*$presidents, index*/ 4608 && image_href_value !== (image_href_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].image)) {
    				attr_dev(image, "href", image_href_value);
    			}

    			if (dirty[0] & /*cx, outerRadius*/ 36 && line_x__value !== (line_x__value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && line_y__value !== (line_y__value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty[0] & /*cx, outerRadius*/ 36 && line_x__value_1 !== (line_x__value_1 = /*cx*/ ctx[2] + /*outerRadius*/ ctx[5])) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && line_y__value_1 !== (line_y__value_1 = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty[0] & /*stroke*/ 64) {
    				attr_dev(line, "stroke", /*stroke*/ ctx[6]);
    			}

    			if (dirty[0] & /*strokeWidth*/ 128) {
    				attr_dev(line, "stroke-width", /*strokeWidth*/ ctx[7]);
    			}

    			if (dirty[0] & /*cx, outerRadius*/ 36 && circle1_cx_value !== (circle1_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5])) {
    				attr_dev(circle1, "cx", circle1_cx_value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && circle1_cy_value !== (circle1_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle1, "cy", circle1_cy_value);
    			}

    			if (/*hoveredBirthIndex*/ ctx[0] === /*index*/ ctx[9]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
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

    			if (dirty[0] & /*$presidents, index*/ 4608 && t0_value !== (t0_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].name + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*cx*/ 4) {
    				attr_dev(text0, "x", /*cx*/ ctx[2]);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && text0_y_value !== (text0_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 20)) {
    				attr_dev(text0, "y", text0_y_value);
    			}

    			if (dirty[0] & /*$presidents, index*/ 4608 && t1_value !== (t1_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyStart + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*$presidents, index*/ 4608 && t3_value !== (t3_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*cx*/ 4) {
    				attr_dev(text1, "x", /*cx*/ ctx[2]);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && text1_y_value !== (text1_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 - 5)) {
    				attr_dev(text1, "y", text1_y_value);
    			}

    			if (dirty[0] & /*$presidents, index*/ 4608 && t4_value !== (t4_value = /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear + "")) set_data_dev(t4, t4_value);

    			if (dirty[0] & /*cx, outerRadius*/ 36 && text2_x_value !== (text2_x_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] - 10)) {
    				attr_dev(text2, "x", text2_x_value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && text2_y_value !== (text2_y_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5 + 5)) {
    				attr_dev(text2, "y", text2_y_value);
    			}

    			if (dirty[0] & /*cx, outerRadius, $presidents, index*/ 4644 && circle2_cx_value !== (circle2_cx_value = /*cx*/ ctx[2] - /*outerRadius*/ ctx[5] + (/*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyStart - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) / ((/*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear === ""
    			? 2025
    			: /*$presidents*/ ctx[12][/*index*/ ctx[9]].deathYear) - /*$presidents*/ ctx[12][/*index*/ ctx[9]].birthYear) * (2 * /*outerRadius*/ ctx[5]))) {
    				attr_dev(circle2, "cx", circle2_cx_value);
    			}

    			if (dirty[0] & /*cy, outerRadius*/ 40 && circle2_cy_value !== (circle2_cy_value = /*cy*/ ctx[3] + /*outerRadius*/ ctx[5] * 1.5)) {
    				attr_dev(circle2, "cy", circle2_cy_value);
    			}

    			if (/*$presidents*/ ctx[12][/*index*/ ctx[9]].presidencyEnd !== "Current President") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(g, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*$presidents, $selectedCircleId, index*/ 6656) show_if = /*$presidents*/ ctx[12][/*$selectedCircleId*/ ctx[11]] || /*$presidents*/ ctx[12][/*$selectedCircleId*/ ctx[11]]?.otherPresidents.includes(/*$presidents*/ ctx[12][/*index*/ ctx[9]].name);

    			if (show_if) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$1(ctx);
    					if_block3.c();
    					if_block3.m(g, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty[0] & /*index*/ 512 && g_class_value !== (g_class_value = "circle-" + /*index*/ ctx[9])) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (dirty[0] & /*$selectedCircleId, index, $presidents*/ 6656 && g_opacity_value !== (g_opacity_value = `circle-${/*$selectedCircleId*/ ctx[11]}` === "circle-null" || `circle-${/*$selectedCircleId*/ ctx[11]}` === "circle-" + /*index*/ ctx[9] || /*$presidents*/ ctx[12][/*$selectedCircleId*/ ctx[11]]?.otherPresidents.includes(/*$presidents*/ ctx[12][/*index*/ ctx[9]].name)
    			? 1
    			: 0.4)) {
    				attr_dev(g, "opacity", g_opacity_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
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

    function calculateArcPath(cx, cy, radius, arcIndex, totalArcs) {
    	const anglePerArc = 2 * Math.PI / totalArcs;
    	const startAngle = -Math.PI / 2 + arcIndex * anglePerArc;
    	const endAngle = -Math.PI / 2 + (arcIndex + 1) * anglePerArc;
    	const x1 = cx + radius * Math.cos(startAngle);
    	const y1 = cy + radius * Math.sin(startAngle);
    	const x2 = cx + radius * Math.cos(endAngle);
    	const y2 = cy + radius * Math.sin(endAngle);
    	return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
    }

    function handleImageKeydown(event) {
    	console.log("key down on image");
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $selectedCircleId;
    	let $presidents;
    	validate_store(selectedCircleId, 'selectedCircleId');
    	component_subscribe($$self, selectedCircleId, $$value => $$invalidate(11, $selectedCircleId = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(12, $presidents = $$value));
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

    	function handleImageClick(event) {
    		event.stopPropagation();
    		const id = event.target.dataset.index;
    		selectedCircleId.set(id);
    	}

    	function isActive(index) {
    		return index.toString() === $selectedCircleId;
    	}

    	$$self.$$.on_mount.push(function () {
    		if (cx === undefined && !('cx' in $$props || $$self.$$.bound[$$self.$$.props['cx']])) {
    			console_1$1.warn("<OnePresidentUnit> was created without expected prop 'cx'");
    		}

    		if (cy === undefined && !('cy' in $$props || $$self.$$.bound[$$self.$$.props['cy']])) {
    			console_1$1.warn("<OnePresidentUnit> was created without expected prop 'cy'");
    		}

    		if (innerRadius === undefined && !('innerRadius' in $$props || $$self.$$.bound[$$self.$$.props['innerRadius']])) {
    			console_1$1.warn("<OnePresidentUnit> was created without expected prop 'innerRadius'");
    		}

    		if (outerRadius === undefined && !('outerRadius' in $$props || $$self.$$.bound[$$self.$$.props['outerRadius']])) {
    			console_1$1.warn("<OnePresidentUnit> was created without expected prop 'outerRadius'");
    		}

    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console_1$1.warn("<OnePresidentUnit> was created without expected prop 'index'");
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<OnePresidentUnit> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = (arcIndex, event) => {
    		event.stopPropagation();
    		if (!isActive(index)) return;

    		//TO DO: how to avoid getElementById
    		$$invalidate(10, hoveredArc = `${index}-${arcIndex}`);

    		const div = document.getElementById(`president-${index}-Quote`);
    		div.innerHTML = $presidents[index].policies[arcIndex];
    		console.log("here");
    	};

    	const mouseout_handler = () => {
    		$$invalidate(10, hoveredArc = null);
    		const div = document.getElementById(`president-${index}-Quote`);
    		div.innerHTML = "";
    	}; //div.innerHTML = $presidents[index].quote;

    	const focus_handler = arcIndex => $$invalidate(10, hoveredArc = `${index}-${arcIndex}`);
    	const blur_handler = () => $$invalidate(10, hoveredArc = null);

    	const click_handler = (arcIndex, event) => {
    		event.stopPropagation();
    		if (!isActive(index)) return;

    		if (index.toString() == $selectedCircleId) {
    			//TO DO : how to avoid getElementById
    			$$invalidate(10, hoveredArc = `${index}-${arcIndex}`);

    			const div = document.getElementById(`president-${index}-Quote`);
    			div.innerHTML = $presidents[index].policies[arcIndex];
    		}
    	};

    	const keydown_handler = arcIndex => {
    		$$invalidate(10, hoveredArc = `${index}-${arcIndex}`);
    	};

    	const click_handler_1 = event => handleImageClick(event);
    	const keydown_handler_1 = event => handleImageKeydown();
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
    		selectedCircleId,
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
    		handleImageClick,
    		handleImageKeydown,
    		isActive,
    		$selectedCircleId,
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
    		$selectedCircleId,
    		$presidents,
    		handleImageClick,
    		isActive,
    		mouseover_handler,
    		mouseout_handler,
    		focus_handler,
    		blur_handler,
    		click_handler,
    		keydown_handler,
    		click_handler_1,
    		keydown_handler_1,
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

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
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
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OnePresidentUnit",
    			options,
    			id: create_fragment$3.name
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

    const { console: console_1 } = globals;
    const file$2 = "src/components/Svg.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (102:2) {#each positions as position, index}
    function create_each_block$1(ctx) {
    	let onepresidentunit;
    	let current;

    	function presidentClick_handler() {
    		return /*presidentClick_handler*/ ctx[11](/*index*/ ctx[16]);
    	}

    	onepresidentunit = new OnePresidentUnit({
    			props: {
    				cx: /*position*/ ctx[14].cx,
    				cy: /*position*/ ctx[14].cy,
    				innerRadius: /*$innerRadius*/ ctx[4],
    				outerRadius: /*$outerRadius*/ ctx[0],
    				index: /*index*/ ctx[16]
    			},
    			$$inline: true
    		});

    	onepresidentunit.$on("presidentClick", presidentClick_handler);

    	const block = {
    		c: function create() {
    			create_component(onepresidentunit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(onepresidentunit, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const onepresidentunit_changes = {};
    			if (dirty & /*positions*/ 4) onepresidentunit_changes.cx = /*position*/ ctx[14].cx;
    			if (dirty & /*positions*/ 4) onepresidentunit_changes.cy = /*position*/ ctx[14].cy;
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(102:2) {#each positions as position, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let svg;
    	let rect;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*positions*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    			add_location(rect, file$2, 93, 2, 2302);
    			attr_dev(svg, "width", /*$svgWidth*/ ctx[1]);
    			attr_dev(svg, "height", /*$svgHeight*/ ctx[3]);
    			add_location(svg, file$2, 87, 0, 2193);
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

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*handleSvgClick*/ ctx[5], false, false, false, false),
    					listen_dev(svg, "keydown", /*handleSvgClick*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$svgWidth*/ 2) {
    				attr_dev(rect, "width", /*$svgWidth*/ ctx[1]);
    			}

    			if (!current || dirty & /*$svgHeight*/ 8) {
    				attr_dev(rect, "height", /*$svgHeight*/ ctx[3]);
    			}

    			if (dirty & /*positions, $innerRadius, $outerRadius, handlePresidentClick*/ 21) {
    				each_value = /*positions*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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

    function handlePresidentClick(index) {
    	popupVisible.set(true);
    	console.log("hello");
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    	component_subscribe($$self, titleSpace, $$value => $$invalidate(6, $titleSpace = $$value));
    	validate_store(outerRadius, 'outerRadius');
    	component_subscribe($$self, outerRadius, $$value => $$invalidate(0, $outerRadius = $$value));
    	validate_store(rowSpacing, 'rowSpacing');
    	component_subscribe($$self, rowSpacing, $$value => $$invalidate(7, $rowSpacing = $$value));
    	validate_store(circleSpacing, 'circleSpacing');
    	component_subscribe($$self, circleSpacing, $$value => $$invalidate(8, $circleSpacing = $$value));
    	validate_store(svgWidth, 'svgWidth');
    	component_subscribe($$self, svgWidth, $$value => $$invalidate(1, $svgWidth = $$value));
    	validate_store(maxCirclesPerRow, 'maxCirclesPerRow');
    	component_subscribe($$self, maxCirclesPerRow, $$value => $$invalidate(9, $maxCirclesPerRow = $$value));
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(10, $presidents = $$value));
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

    	function handleSvgClick() {
    		console.log("svg clicked");
    		selectedCircleId.set(null);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	const presidentClick_handler = index => handlePresidentClick();

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
    		selectedCircleId,
    		OnePresidentUnit,
    		presidents,
    		onMount,
    		get: get_store_value,
    		positions,
    		updateSvgWidth,
    		updateSvgHeight,
    		handleSvgClick,
    		handlePresidentClick,
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
    		if ($$self.$$.dirty & /*$presidents, $maxCirclesPerRow, $outerRadius, $circleSpacing, $svgWidth, $rowSpacing, $titleSpace*/ 1987) {
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
    		handleSvgClick,
    		$titleSpace,
    		$rowSpacing,
    		$circleSpacing,
    		$maxCirclesPerRow,
    		$presidents,
    		presidentClick_handler
    	];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/stickyYearsDiv.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/components/stickyYearsDiv.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (83:8) {#if president["terms"] === 2}
    function create_if_block_1(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_stroke_width_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", circle_cx_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgWidth*/ ctx[0] - 2 * desktopRadius) + desktopRadius);
    			attr_dev(circle, "cy", "18");
    			attr_dev(circle, "r", desktopConcentricRadius);
    			attr_dev(circle, "fill", "white");
    			attr_dev(circle, "opacity", "0.3");
    			attr_dev(circle, "stroke", "black");

    			attr_dev(circle, "stroke-width", circle_stroke_width_value = /*$selectedCircleId*/ ctx[3] == /*index*/ ctx[18]
    			? "3"
    			: "1");

    			attr_dev(circle, "class", "" + (null_to_empty(`circle-${/*index*/ ctx[18]}`) + " svelte-nu0qkm"));
    			attr_dev(circle, "data-index", /*index*/ ctx[18]);
    			add_location(circle, file$1, 83, 10, 2168);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "click", /*click_handler_1*/ ctx[9], false, false, false, false),
    					listen_dev(circle, "keydown", /*keydown_handler_1*/ ctx[10], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*svgWidth*/ 1 && circle_cx_value !== (circle_cx_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgWidth*/ ctx[0] - 2 * desktopRadius) + desktopRadius)) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*$selectedCircleId*/ 8 && circle_stroke_width_value !== (circle_stroke_width_value = /*$selectedCircleId*/ ctx[3] == /*index*/ ctx[18]
    			? "3"
    			: "1")) {
    				attr_dev(circle, "stroke-width", circle_stroke_width_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(83:8) {#if president[\\\"terms\\\"] === 2}",
    		ctx
    	});

    	return block;
    }

    // (54:4) {#each $presidents as president, index}
    function create_each_block_1(ctx) {
    	let text_1;
    	let t_value = /*getInitials*/ ctx[6](/*president*/ ctx[16].name) + "";
    	let t;
    	let text_1_x_value;
    	let g;
    	let circle;
    	let circle_cx_value;
    	let circle_stroke_width_value;
    	let mounted;
    	let dispose;
    	let if_block = /*president*/ ctx[16]["terms"] === 2 && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			g = svg_element("g");
    			circle = svg_element("circle");
    			if (if_block) if_block.c();
    			attr_dev(text_1, "x", text_1_x_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgWidth*/ ctx[0] - 2 * desktopRadius) + desktopRadius);
    			attr_dev(text_1, "y", "18");
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "9px");
    			attr_dev(text_1, "fill", "black");
    			attr_dev(text_1, "dy", "4");
    			add_location(text_1, file$1, 54, 6, 1335);
    			attr_dev(circle, "cx", circle_cx_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgWidth*/ ctx[0] - 2 * desktopRadius) + desktopRadius);
    			attr_dev(circle, "cy", "18");
    			attr_dev(circle, "r", desktopRadius);
    			attr_dev(circle, "fill", "white");
    			attr_dev(circle, "opacity", "0.3");
    			attr_dev(circle, "stroke", "black");

    			attr_dev(circle, "stroke-width", circle_stroke_width_value = /*$selectedCircleId*/ ctx[3] == /*index*/ ctx[18]
    			? "3"
    			: "1");

    			attr_dev(circle, "class", "" + (null_to_empty(`circle-${/*index*/ ctx[18]}`) + " svelte-nu0qkm"));
    			attr_dev(circle, "data-index", /*index*/ ctx[18]);
    			add_location(circle, file$1, 67, 8, 1621);
    			add_location(g, file$1, 66, 6, 1609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    			insert_dev(target, g, anchor);
    			append_dev(g, circle);
    			if (if_block) if_block.m(g, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "click", /*click_handler*/ ctx[7], false, false, false, false),
    					listen_dev(circle, "keydown", /*keydown_handler*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presidents*/ 4 && t_value !== (t_value = /*getInitials*/ ctx[6](/*president*/ ctx[16].name) + "")) set_data_dev(t, t_value);

    			if (dirty & /*svgWidth*/ 1 && text_1_x_value !== (text_1_x_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgWidth*/ ctx[0] - 2 * desktopRadius) + desktopRadius)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*svgWidth*/ 1 && circle_cx_value !== (circle_cx_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgWidth*/ ctx[0] - 2 * desktopRadius) + desktopRadius)) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*$selectedCircleId*/ 8 && circle_stroke_width_value !== (circle_stroke_width_value = /*$selectedCircleId*/ ctx[3] == /*index*/ ctx[18]
    			? "3"
    			: "1")) {
    				attr_dev(circle, "stroke-width", circle_stroke_width_value);
    			}

    			if (/*president*/ ctx[16]["terms"] === 2) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(g, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    			if (detaching) detach_dev(g);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(54:4) {#each $presidents as president, index}",
    		ctx
    	});

    	return block;
    }

    // (144:8) {#if president["terms"] === 2}
    function create_if_block(ctx) {
    	let circle;
    	let circle_cy_value;
    	let circle_stroke_width_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "10");
    			attr_dev(circle, "cy", circle_cy_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgHeight*/ ctx[1] - 2 * mobileConcentricRadius) + mobileConcentricRadius);
    			attr_dev(circle, "r", mobileConcentricRadius);
    			attr_dev(circle, "fill", "white");
    			attr_dev(circle, "opacity", "0.3");
    			attr_dev(circle, "stroke", "black");

    			attr_dev(circle, "stroke-width", circle_stroke_width_value = /*$selectedCircleId*/ ctx[3] == /*index*/ ctx[18]
    			? "3"
    			: "1");

    			attr_dev(circle, "class", "" + (null_to_empty(`circle-${/*index*/ ctx[18]}`) + " svelte-nu0qkm"));
    			attr_dev(circle, "data-index", /*index*/ ctx[18]);
    			add_location(circle, file$1, 144, 10, 3780);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "click", /*click_handler_3*/ ctx[13], false, false, false, false),
    					listen_dev(circle, "keydown", /*keydown_handler_3*/ ctx[14], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*svgHeight*/ 2 && circle_cy_value !== (circle_cy_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgHeight*/ ctx[1] - 2 * mobileConcentricRadius) + mobileConcentricRadius)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*$selectedCircleId*/ 8 && circle_stroke_width_value !== (circle_stroke_width_value = /*$selectedCircleId*/ ctx[3] == /*index*/ ctx[18]
    			? "3"
    			: "1")) {
    				attr_dev(circle, "stroke-width", circle_stroke_width_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(144:8) {#if president[\\\"terms\\\"] === 2}",
    		ctx
    	});

    	return block;
    }

    // (116:4) {#each $presidents as president, index}
    function create_each_block(ctx) {
    	let text_1;
    	let t_value = /*getInitials*/ ctx[6](/*president*/ ctx[16].name) + "";
    	let t;
    	let text_1_y_value;
    	let g;
    	let circle;
    	let circle_cy_value;
    	let mounted;
    	let dispose;
    	let if_block = /*president*/ ctx[16]["terms"] === 2 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			g = svg_element("g");
    			circle = svg_element("circle");
    			if (if_block) if_block.c();
    			attr_dev(text_1, "x", "10");
    			attr_dev(text_1, "y", text_1_y_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgHeight*/ ctx[1] - 2 * mobileRadius) + mobileRadius + 4);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-size", "6px");
    			attr_dev(text_1, "fill", "black");
    			add_location(text_1, file$1, 116, 6, 3015);
    			attr_dev(circle, "cx", "10");
    			attr_dev(circle, "cy", circle_cy_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgHeight*/ ctx[1] - 2 * mobileRadius) + mobileRadius);
    			attr_dev(circle, "r", mobileRadius);
    			attr_dev(circle, "fill", "white");
    			attr_dev(circle, "opacity", "0.3");
    			attr_dev(circle, "stroke", "black");
    			attr_dev(circle, "class", "" + (null_to_empty(`circle-${/*index*/ ctx[18]}`) + " svelte-nu0qkm"));
    			attr_dev(circle, "data-index", /*index*/ ctx[18]);
    			add_location(circle, file$1, 129, 8, 3299);
    			add_location(g, file$1, 128, 6, 3287);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    			insert_dev(target, g, anchor);
    			append_dev(g, circle);
    			if (if_block) if_block.m(g, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(circle, "click", /*click_handler_2*/ ctx[11], false, false, false, false),
    					listen_dev(circle, "keydown", /*keydown_handler_2*/ ctx[12], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presidents*/ 4 && t_value !== (t_value = /*getInitials*/ ctx[6](/*president*/ ctx[16].name) + "")) set_data_dev(t, t_value);

    			if (dirty & /*svgHeight*/ 2 && text_1_y_value !== (text_1_y_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgHeight*/ ctx[1] - 2 * mobileRadius) + mobileRadius + 4)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*svgHeight*/ 2 && circle_cy_value !== (circle_cy_value = /*index*/ ctx[18] / (/*totalDots*/ ctx[4] - 1) * (/*svgHeight*/ ctx[1] - 2 * mobileRadius) + mobileRadius)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (/*president*/ ctx[16]["terms"] === 2) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(g, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    			if (detaching) detach_dev(g);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(116:4) {#each $presidents as president, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div0;
    	let svg0;
    	let rect0;
    	let t;
    	let div1;
    	let svg1;
    	let rect1;
    	let each_value_1 = /*$presidents*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*$presidents*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			rect1 = svg_element("rect");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "100%");
    			attr_dev(rect0, "height", "100%");
    			attr_dev(rect0, "fill", "white");
    			attr_dev(rect0, "stroke", "black");
    			attr_dev(rect0, "stroke-width", "2");
    			add_location(rect0, file$1, 42, 4, 1102);
    			attr_dev(svg0, "width", "100%");
    			attr_dev(svg0, "height", "100%");
    			add_location(svg0, file$1, 41, 2, 1065);
    			attr_dev(div0, "class", "desktop-sticky-div svelte-nu0qkm");
    			add_location(div0, file$1, 40, 0, 1030);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "0");
    			attr_dev(rect1, "width", "100%");
    			attr_dev(rect1, "height", "100%");
    			attr_dev(rect1, "fill", "none");
    			attr_dev(rect1, "stroke", "black");
    			attr_dev(rect1, "stroke-width", "2");
    			add_location(rect1, file$1, 105, 4, 2826);
    			attr_dev(svg1, "width", "100%");
    			attr_dev(svg1, "height", "100%");
    			add_location(svg1, file$1, 104, 2, 2789);
    			attr_dev(div1, "class", "mobile-sticky-div svelte-nu0qkm");
    			add_location(div1, file$1, 103, 0, 2755);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, svg0);
    			append_dev(svg0, rect0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(svg0, null);
    				}
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, svg1);
    			append_dev(svg1, rect1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(svg1, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*totalDots, svgWidth, desktopRadius, desktopConcentricRadius, $selectedCircleId, handleCircleClick, $presidents, getInitials*/ 125) {
    				each_value_1 = /*$presidents*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(svg0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*totalDots, svgHeight, mobileConcentricRadius, $selectedCircleId, handleCircleClick, $presidents, mobileRadius, getInitials*/ 126) {
    				each_value = /*$presidents*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
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

    const desktopRadius = 8;
    const desktopConcentricRadius = 10;
    const mobileRadius = 5;
    const mobileConcentricRadius = 8;

    function instance$1($$self, $$props, $$invalidate) {
    	let $presidents;
    	let $selectedCircleId;
    	validate_store(presidents, 'presidents');
    	component_subscribe($$self, presidents, $$value => $$invalidate(2, $presidents = $$value));
    	validate_store(selectedCircleId, 'selectedCircleId');
    	component_subscribe($$self, selectedCircleId, $$value => $$invalidate(3, $selectedCircleId = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StickyYearsDiv', slots, []);
    	let totalDots = 47;
    	let svgWidth = 0;
    	let svgHeight = 0;

    	const updateDimensions = () => {
    		$$invalidate(0, svgWidth = window.innerWidth);
    		$$invalidate(1, svgHeight = window.innerHeight);
    	};

    	onMount(() => {
    		updateDimensions();
    		window.addEventListener("resize", updateDimensions);
    	});

    	const handleCircleClick = event => {
    		let id = event.target.dataset.index;
    		selectedCircleId.set(id);
    	}; //console.log(`circle-${id}`);

    	const getInitials = name => {
    		const parts = name.split(" ");

    		if (parts.length === 1) {
    			return parts[0][0].toUpperCase();
    		}

    		const firstInitial = parts[0][0].toUpperCase();
    		const lastInitial = parts[parts.length - 1][0].toUpperCase();
    		return firstInitial + lastInitial;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StickyYearsDiv> was created with unknown prop '${key}'`);
    	});

    	const click_handler = event => handleCircleClick(event);
    	const keydown_handler = e => e.key === "Enter" && handleCircleClick(e);
    	const click_handler_1 = event => handleCircleClick(event);
    	const keydown_handler_1 = e => e.key === "Enter" && handleCircleClick(e);
    	const click_handler_2 = event => handleCircleClick(event);
    	const keydown_handler_2 = e => e.key === "Enter" && handleCircleClick(e);
    	const click_handler_3 = event => handleCircleClick(event);
    	const keydown_handler_3 = e => e.key === "Enter" && handleCircleClick(e);

    	$$self.$capture_state = () => ({
    		presidents,
    		onMount,
    		selectedCircleId,
    		totalDots,
    		svgWidth,
    		svgHeight,
    		desktopRadius,
    		desktopConcentricRadius,
    		mobileRadius,
    		mobileConcentricRadius,
    		updateDimensions,
    		handleCircleClick,
    		getInitials,
    		$presidents,
    		$selectedCircleId
    	});

    	$$self.$inject_state = $$props => {
    		if ('totalDots' in $$props) $$invalidate(4, totalDots = $$props.totalDots);
    		if ('svgWidth' in $$props) $$invalidate(0, svgWidth = $$props.svgWidth);
    		if ('svgHeight' in $$props) $$invalidate(1, svgHeight = $$props.svgHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		svgWidth,
    		svgHeight,
    		$presidents,
    		$selectedCircleId,
    		totalDots,
    		handleCircleClick,
    		getInitials,
    		click_handler,
    		keydown_handler,
    		click_handler_1,
    		keydown_handler_1,
    		click_handler_2,
    		keydown_handler_2,
    		click_handler_3,
    		keydown_handler_3
    	];
    }

    class StickyYearsDiv extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StickyYearsDiv",
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
    	let t;
    	let stickyyearsdiv;
    	let current;
    	svg = new Svg({ $$inline: true });
    	stickyyearsdiv = new StickyYearsDiv({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(svg.$$.fragment);
    			t = space();
    			create_component(stickyyearsdiv.$$.fragment);
    			attr_dev(main, "class", "svelte-177t831");
    			add_location(main, file, 5, 0, 132);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(svg, main, null);
    			append_dev(main, t);
    			mount_component(stickyyearsdiv, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svg.$$.fragment, local);
    			transition_in(stickyyearsdiv.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svg.$$.fragment, local);
    			transition_out(stickyyearsdiv.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(svg);
    			destroy_component(stickyyearsdiv);
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

    	$$self.$capture_state = () => ({ Svg, StickyYearsDiv });
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
