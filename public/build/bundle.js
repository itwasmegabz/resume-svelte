
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (svelteChartjs, chart_js) {
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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

    /* src/components/Header.svelte generated by Svelte v3.59.2 */

    const file$3 = "src/components/Header.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (12:6) {#each contact as item}
    function create_each_block$1(ctx) {
    	let p;
    	let t_value = /*item*/ ctx[2] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$3, 12, 8, 384);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*contact*/ 2 && t_value !== (t_value = /*item*/ ctx[2] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(12:6) {#each contact as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t1;
    	let t2;
    	let each_value = /*contact*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (!src_url_equal(img.src, img_src_value = "pabriel.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*name*/ ctx[0]);
    			attr_dev(img, "class", "w-full h-full object-cover");
    			add_location(img, file$3, 7, 6, 188);
    			attr_dev(div0, "class", "w-24 h-32 bg-gray-400 mr-5");
    			add_location(div0, file$3, 6, 4, 141);
    			attr_dev(h1, "class", "text-2xl font-bold");
    			add_location(h1, file$3, 10, 6, 303);
    			attr_dev(div1, "class", "flex-grow");
    			add_location(div1, file$3, 9, 4, 273);
    			attr_dev(div2, "class", "flex items-center border-b-2 border-black pb-5 mb-5");
    			add_location(div2, file$3, 5, 2, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) {
    				attr_dev(img, "alt", /*name*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);

    			if (dirty & /*contact*/ 2) {
    				each_value = /*contact*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
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
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { name } = $$props;
    	let { contact } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<Header> was created without expected prop 'name'");
    		}

    		if (contact === undefined && !('contact' in $$props || $$self.$$.bound[$$self.$$.props['contact']])) {
    			console.warn("<Header> was created without expected prop 'contact'");
    		}
    	});

    	const writable_props = ['name', 'contact'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('contact' in $$props) $$invalidate(1, contact = $$props.contact);
    	};

    	$$self.$capture_state = () => ({ name, contact });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('contact' in $$props) $$invalidate(1, contact = $$props.contact);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, contact];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { name: 0, contact: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get name() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contact() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contact(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Experience.svelte generated by Svelte v3.59.2 */

    const file$2 = "src/components/Experience.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (18:10) {#each exp.responsibilities as responsibility}
    function create_each_block_1(ctx) {
    	let li;
    	let t_value = /*responsibility*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$2, 18, 12, 638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*experiences*/ 1 && t_value !== (t_value = /*responsibility*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(18:10) {#each exp.responsibilities as responsibility}",
    		ctx
    	});

    	return block;
    }

    // (7:4) {#each experiences as exp}
    function create_each_block(ctx) {
    	let div2;
    	let div0;
    	let h3;
    	let t0_value = /*exp*/ ctx[1].company + "";
    	let t0;
    	let t1;
    	let span0;
    	let t2_value = /*exp*/ ctx[1].dates + "";
    	let t2;
    	let t3;
    	let div1;
    	let span1;
    	let t4_value = /*exp*/ ctx[1].role + "";
    	let t4;
    	let t5;
    	let span2;
    	let t6_value = /*exp*/ ctx[1].location + "";
    	let t6;
    	let t7;
    	let ul;
    	let t8;
    	let each_value_1 = /*exp*/ ctx[1].responsibilities;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			span1 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			span2 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			attr_dev(h3, "class", "font-bold");
    			add_location(h3, file$2, 9, 10, 283);
    			attr_dev(span0, "class", "font-bold");
    			add_location(span0, file$2, 10, 10, 334);
    			attr_dev(div0, "class", "flex justify-between mb-2");
    			add_location(div0, file$2, 8, 8, 233);
    			add_location(span1, file$2, 13, 10, 457);
    			add_location(span2, file$2, 14, 10, 491);
    			attr_dev(div1, "class", "flex justify-between italic mb-3");
    			add_location(div1, file$2, 12, 8, 400);
    			attr_dev(ul, "class", "list-none p-0");
    			add_location(ul, file$2, 16, 8, 542);
    			attr_dev(div2, "class", "bg-gray-200 rounded-lg p-4 mb-5");
    			add_location(div2, file$2, 7, 6, 179);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t0);
    			append_dev(div0, t1);
    			append_dev(div0, span0);
    			append_dev(span0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, span1);
    			append_dev(span1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, span2);
    			append_dev(span2, t6);
    			append_dev(div2, t7);
    			append_dev(div2, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_dev(div2, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*experiences*/ 1 && t0_value !== (t0_value = /*exp*/ ctx[1].company + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*experiences*/ 1 && t2_value !== (t2_value = /*exp*/ ctx[1].dates + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*experiences*/ 1 && t4_value !== (t4_value = /*exp*/ ctx[1].role + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*experiences*/ 1 && t6_value !== (t6_value = /*exp*/ ctx[1].location + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*experiences*/ 1) {
    				each_value_1 = /*exp*/ ctx[1].responsibilities;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(7:4) {#each experiences as exp}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let each_value = /*experiences*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Experiences";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "bg-black text-white px-3 py-1 mb-3");
    			add_location(h2, file$2, 5, 4, 78);
    			attr_dev(div, "class", "w-3/4");
    			add_location(div, file$2, 4, 2, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*experiences*/ 1) {
    				each_value = /*experiences*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Experience', slots, []);
    	let { experiences } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (experiences === undefined && !('experiences' in $$props || $$self.$$.bound[$$self.$$.props['experiences']])) {
    			console.warn("<Experience> was created without expected prop 'experiences'");
    		}
    	});

    	const writable_props = ['experiences'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Experience> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('experiences' in $$props) $$invalidate(0, experiences = $$props.experiences);
    	};

    	$$self.$capture_state = () => ({ experiences });

    	$$self.$inject_state = $$props => {
    		if ('experiences' in $$props) $$invalidate(0, experiences = $$props.experiences);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [experiences];
    }

    class Experience extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { experiences: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Experience",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get experiences() {
    		throw new Error("<Experience>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set experiences(value) {
    		throw new Error("<Experience>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Education.svelte generated by Svelte v3.59.2 */

    function create_fragment$4(ctx) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Education', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Education> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Education extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Education",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Skills.svelte generated by Svelte v3.59.2 */

    const file$1 = "src/components/Skills.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let bar;
    	let current;

    	bar = new svelteChartjs.Bar({
    			props: {
    				chartData: /*chartData*/ ctx[0],
    				chartOptions: /*chartOptions*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Skills";
    			t1 = space();
    			create_component(bar.$$.fragment);
    			attr_dev(h2, "class", "bg-black text-white px-3 py-1 mb-3");
    			add_location(h2, file$1, 37, 4, 936);
    			attr_dev(div, "class", "w-full");
    			add_location(div, file$1, 36, 2, 911);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			mount_component(bar, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(bar);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skills', slots, []);
    	chart_js.Chart.register(chart_js.BarElement, chart_js.CategoryScale, chart_js.LinearScale, chart_js.Tooltip, chart_js.Legend);

    	let skills = [
    		{ skill: 'HTML', level: 90 },
    		{ skill: 'CSS', level: 85 },
    		{ skill: 'JavaScript', level: 75 }
    	]; // Add more skills

    	let chartData = {
    		labels: skills.map(s => s.skill),
    		datasets: [
    			{
    				label: 'Skill Level',
    				data: skills.map(s => s.level),
    				backgroundColor: 'rgba(75, 192, 192, 0.2)',
    				borderColor: 'rgba(75, 192, 192, 1)',
    				borderWidth: 1
    			}
    		]
    	};

    	let chartOptions = {
    		responsive: true,
    		scales: { y: { beginAtZero: true } }
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skills> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Bar: svelteChartjs.Bar,
    		ChartJS: chart_js.Chart,
    		BarElement: chart_js.BarElement,
    		CategoryScale: chart_js.CategoryScale,
    		LinearScale: chart_js.LinearScale,
    		Tooltip: chart_js.Tooltip,
    		Legend: chart_js.Legend,
    		skills,
    		chartData,
    		chartOptions
    	});

    	$$self.$inject_state = $$props => {
    		if ('skills' in $$props) skills = $$props.skills;
    		if ('chartData' in $$props) $$invalidate(0, chartData = $$props.chartData);
    		if ('chartOptions' in $$props) $$invalidate(1, chartOptions = $$props.chartOptions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [chartData, chartOptions];
    }

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Interests.svelte generated by Svelte v3.59.2 */

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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Interests', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Interests> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Interests extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Interests",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Associations.svelte generated by Svelte v3.59.2 */

    function create_fragment$1(ctx) {
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Associations', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Associations> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Associations extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Associations",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t0;
    	let education_1;
    	let t1;
    	let experience;
    	let t2;
    	let skills_1;
    	let t3;
    	let interests_1;
    	let t4;
    	let associations_1;
    	let current;

    	header = new Header({
    			props: {
    				name: /*headerData*/ ctx[0].name,
    				contact: /*headerData*/ ctx[0].contact
    			},
    			$$inline: true
    		});

    	education_1 = new Education({
    			props: { education: /*education*/ ctx[2] },
    			$$inline: true
    		});

    	experience = new Experience({
    			props: { experiences: /*experiences*/ ctx[1] },
    			$$inline: true
    		});

    	skills_1 = new Skills({ $$inline: true });
    	interests_1 = new Interests({ $$inline: true });

    	associations_1 = new Associations({
    			props: { associations: /*associations*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(education_1.$$.fragment);
    			t1 = space();
    			create_component(experience.$$.fragment);
    			t2 = space();
    			create_component(skills_1.$$.fragment);
    			t3 = space();
    			create_component(interests_1.$$.fragment);
    			t4 = space();
    			create_component(associations_1.$$.fragment);
    			attr_dev(main, "class", "max-w-2xl mx-auto p-5 bg-white border-2 border-black shadow-lg");
    			add_location(main, file, 133, 2, 4717);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(education_1, main, null);
    			append_dev(main, t1);
    			mount_component(experience, main, null);
    			append_dev(main, t2);
    			mount_component(skills_1, main, null);
    			append_dev(main, t3);
    			mount_component(interests_1, main, null);
    			append_dev(main, t4);
    			mount_component(associations_1, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(education_1.$$.fragment, local);
    			transition_in(experience.$$.fragment, local);
    			transition_in(skills_1.$$.fragment, local);
    			transition_in(interests_1.$$.fragment, local);
    			transition_in(associations_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(education_1.$$.fragment, local);
    			transition_out(experience.$$.fragment, local);
    			transition_out(skills_1.$$.fragment, local);
    			transition_out(interests_1.$$.fragment, local);
    			transition_out(associations_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(education_1);
    			destroy_component(experience);
    			destroy_component(skills_1);
    			destroy_component(interests_1);
    			destroy_component(associations_1);
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

    	let headerData = {
    		name: "Gabriel Zerguit",
    		contact: [
    			"0652387486",
    			"gabriel@grailcavern.com",
    			"125 Pvenue Pharles pe Paulle, 92200, Peuilly-pur-Peine"
    		]
    	};

    	let experiences = [
    		{
    			company: "Vinci Concessions",
    			dates: "Aug. 2023 – Jan. 2024",
    			role: "M&A Analyst Intern",
    			location: "La Defense, France",
    			responsibilities: [
    				"Collaborated with top management to implement corporate strategy through targeted acquisitions and greenfield projects",
    				"Identified and evaluated new opportunities, conducting preliminary strategic analyses in tandem with Project Directors",
    				"Engaged in project collaborations with both internal and external industrial partners, as well as financial stakeholders. Developed robust implementation cases and structured strategic partnerships effectively",
    				"Provided comprehensive support to Project Managers and Directors across various project facets – from strategic and financial to operational and legal dimensions"
    			]
    		},
    		{
    			company: "KShuttle",
    			dates: "Nov. 2022",
    			role: "Consulting Intern",
    			location: "Levallois-Perret, France",
    			responsibilities: [
    				"Assisted the Director of Consulting and worked closely with a team of consultants to provide strategic solutions for clients in their digital transformation"
    			]
    		},
    		{
    			company: "GrailCavern.com",
    			dates: "Mar. 2020 – Present",
    			role: "Founder",
    			location: "Paris, France",
    			responsibilities: [
    				"As the founder of GrailCavern.com in Paris, France, I played a crucial role in the development and success of a marketplace for reselling collectible toys. The platform has garnered over 80,000 monthly visits and nearly $200,000 in transactions since its inception"
    			]
    		}
    	];

    	let education = [
    		{
    			institution: "ESSEC Business School",
    			dates: "Aug. 2022 – 2025",
    			degree: "Master in Management",
    			location: "Cergy, France",
    			details: [
    				"Advanced Mathematics, Python Programming, Physics as part of a dual degree program with Grande Ecole CentraleSupélec",
    				"Corporate Finance",
    				"Financial Modeling and Accounting",
    				"Business Valuation",
    				"Business Law/Corporate Law"
    			]
    		},
    		{
    			institution: "Intégrale : Institut d’enseignement supérieur privé",
    			dates: "Aug. 2019 – Aug. 2022",
    			degree: "Preparatory classes dedicated to national competitive entrance exams",
    			location: "Paris, France",
    			details: [
    				"Co-admitted to ENS-Paris-Saclay (ranked 7th among all candidates) and ESSEC Business School for the year 2022"
    			]
    		},
    		{
    			institution: "Auckland Grammar School",
    			dates: "Jul 2018 – Dec. 2018",
    			degree: "International Student",
    			location: "Auckland, New Zealand",
    			details: [
    				"Received a $15,000 ’Follow the Kiwi’ scholarship for pursuing studies in New Zealand"
    			]
    		}
    	];

    	let skills = [
    		{
    			skill: 'L<span class="text-xs">A</span>T<span class="text-lg">E</span>X',
    			level: 90
    		},
    		{ skill: 'Python', level: 85 },
    		{ skill: 'Django', level: 80 },
    		{ skill: 'HTML', level: 95 },
    		{ skill: 'CSS', level: 90 },
    		{ skill: 'MS Office', level: 75 },
    		{ skill: 'PowerPoint', level: 85 },
    		{ skill: 'Excel', level: 80 }
    	];

    	let interests = ['Programming', 'Music', 'Composition', 'Writing', 'Painting', 'Videography'];

    	let associations = [
    		{
    			name: "Tech ESSEC",
    			dates: "Nov. 2022 – Present",
    			role: "Active member",
    			location: "Paris, France",
    			details: [
    				"Contributed to the development of the Salmon-AI project, a finalist in the ’EY Assos Award’ and awarded 1,000 euros by Alten. This project employs AI to supplant traditional fish counting methods like electrofishing, making it non-invasive and safer for the fish."
    			]
    		},
    		{
    			name: "ESSEC Africa Society",
    			dates: "Oct. 2022 – Present",
    			role: "Active member",
    			location: "Paris, France",
    			details: [
    				"Consulting for small African companies",
    				"Organizing round-table discussions with influential African leaders",
    				"Seeking partnerships with businesses and universities"
    			]
    		},
    		{
    			name: "Les Fermes d’Espoir CFDJ",
    			dates: "Oct. 2022 – Nov. 2022",
    			role: "Volunteer",
    			location: "Paris, France",
    			details: [
    				"Assisted in Les Fermes d’Espoir CFDJ’s relocation and developed partnerships in Paris, while facilitating youth reintegration through community service and cultural exposure"
    			]
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Experience,
    		Education,
    		Skills,
    		Interests,
    		Associations,
    		headerData,
    		experiences,
    		education,
    		skills,
    		interests,
    		associations
    	});

    	$$self.$inject_state = $$props => {
    		if ('headerData' in $$props) $$invalidate(0, headerData = $$props.headerData);
    		if ('experiences' in $$props) $$invalidate(1, experiences = $$props.experiences);
    		if ('education' in $$props) $$invalidate(2, education = $$props.education);
    		if ('skills' in $$props) skills = $$props.skills;
    		if ('interests' in $$props) interests = $$props.interests;
    		if ('associations' in $$props) $$invalidate(3, associations = $$props.associations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [headerData, experiences, education, associations];
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
      props: {
        name: 'world'
      }
    });

    return app;

})(svelteChartjs, chart_js);
//# sourceMappingURL=bundle.js.map
