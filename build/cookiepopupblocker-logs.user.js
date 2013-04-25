// ==UserScript==
// @name           CookiePopupBlocker
// @version        1.4.1
// @description    Blokuje banery z informacją o używaniu przez witrynę cookies
// @run-at         document-start
// @namespace      https://github.com/piotrex
// @include        *
// @grant          GM_listValues
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_registerMenuCommand
// @grant          GM_registerMenuCommand
// @downloadURL    https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-logs.user.js
// @updateURL      https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-logs.user.js
// @homepage       https://github.com/piotrex/CookiePopupBlocker
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @icon           https://raw.github.com/piotrex/CookiePopupBlocker/master/icon/32x32.png
// ==/UserScript==
var LANG = "pl"; // for now: only one language can be setted
var COOKIE_TITLES = {
    "pl":/cookie|ciastecz/i,
    "en":/cookie/i
};
var COOKIE_WORDS = { // ',' - means conjunction, '|' - disjunction
    "pl": [/cookie|ciastecz/i, /u(ż|z)ywa|korzyst|stosuje|pos(ł|l)ugu/i, /stron|witryn|serwis|portal|jemy/i,/(wiedzie|wi(ę|e)cej|informacj|szczeg|polity|czym s(ą|a)|przegl(a|ą)dar)|(akcept|zgod)/i],
    "en":[/cookie/i, /we |site|our |service/i, /use|store/i, /agree|accept|assume|posit|presume|consent|let|allow|grant|permit|accord|leave|continue/i, /work|experience|purpose|provide|deliver|enhance|enable|preference|let|log|acount|advert|stats/i, /find out|learn|more|info|details|policy|preference|settings|browser|manage/i]
};
var FOOTER_WORDS = {
    "pl": [/©|copyright|creative|zastrzeżone/i], /* "creative commons", "wszelkie prawa zastrzeżone" */
    "en": [/©|copyright|creative|reserved/i] /* "creative commons", "all rights reserved" */
};
var COOKIE_LENGTHS = {// lowest and highest length of textContent of cookie node popup 
    "pl": [100,1000],
    "en": [100,1000]
};
// FF >=14 CHR >=18
var MUTATIONOBSERVER = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
if(window.self === window.top)
{
    ////////////////////////////////////////////////////
    //  General functions
    ////////////////////////////////////////////////////
    function GM__changeJsonAttr(json_name, attr_name, new_value)
    {
        var json_value = JSON.parse(GM_getValue(json_name, "{}"));
        json_value[attr_name] = new_value;
        GM_setValue(json_name, JSON.stringify(json_value));
    }
    // http://stackoverflow.com/a/6169703/1794387
    function XDomainOneWayPOST(_url,/*Array of Objects*/ _data)
    {
        // Add the iframe with a unique name
        var iframe = document.createElement("iframe");
        var uniqueString = "CPB_hgfghf654";
        document.body.appendChild(iframe);
        iframe.style.display = "none";
        iframe.contentWindow.name = uniqueString;
        // construct a form with hidden inputs, targeting the iframe
        var form = document.createElement("form");
        form.target = uniqueString;
        form.action = _url;
        form.method = "POST";
        // repeat for each parameter
        var input;
        for (var i=0, _data_length=_data.length ; i<_data_length ; i++)
        {
            input = document.createElement("input");
            input.type = "hidden";
            input.name = _data[i].name;
            input.value = _data[i].value;
            form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
    }
    // http://stackoverflow.com/a/4588211/1794387
    function getCssSelector(el)
    {
        var names = [];
        while (el.parentNode)
        {
            if (el.id)
            {
                names.unshift('#' + el.id);
                break;
            }
            else if(el.className)
            {
                classes = el.className.split(' ');
                names.unshift('.'+classes[0]);
                break;
            }
            else
            {
                if (el == el.ownerDocument.documentElement)
                    names.unshift(el.tagName);
                else
                {
                    for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
                    names.unshift(el.tagName + ":nth-child(" + c + ")");
                }
                el = el.parentNode;
            }
        }
        return names.join(">");
    }
    // some speed tests: http://jsperf.com/getchildbynodename
    var getNodesInTreeByNodeName = function (node, allowed_node_names)
    {
        var childCollection = [];
        var getTreeNodes = function (tree_root)
        {
            if (allowed_node_names.indexOf(tree_root.nodeName) > -1)
                childCollection.push(tree_root);
            var childs = tree_root.childNodes;
            if (childs)
                for (var i=0, childs_length=childs.length ; i<childs_length ; i++)
                    getTreeNodes(childs[i]);
        };
        getTreeNodes(node);
        return childCollection;
    };
    // http://stackoverflow.com/a/2234986/1794387
    function isDescendant(parent, child)
    {
        var node = child.parentNode;
        while (node !== null)
        {
            if (node == parent)
                return true;
            node = node.parentNode;
        }
        return false;
    }
    ////////////////////////////////////////////////////
    //  Script specific functions
    ////////////////////////////////////////////////////
    function getLogsArray()
    {
        var values_names = GM_listValues();
        var log_name;
        var log_array = [];
        var log_record;
        for (var i=0, values_names_length=values_names.length ; i<values_names_length ; i++)
        {
            if( ! /^CPB_/.test(values_names[i]) )
            {
                log_name = values_names[i];
                log_record = JSON.parse(GM_getValue(values_names[i]));
                log_record['site']=log_name;
                log_array.push(log_record);
            }
        }
        return log_array;
    }
    function cmd_showLogs()
    {
        document.body.innerHTML=("<code>"+JSON.stringify(getLogsArray())+"</code>");
    }
    function cmd_sendLogs()
    {
        XDomainOneWayPOST("https://script.google.com/macros/s/AKfycbyfPf_UT7Dndf7Z_FPvUIC-eIwhS8jijQDuugp2bk3gmhSS8Zbu/exec",[{name:"records",value:JSON.stringify(getLogsArray())}]);
    }
    function cmd_clearLogs()
    {
        var keys = GM_listValues();
        for (var k=0, keys_length=keys.length ; k<keys_length ; k++)
        {
            if(! /^CPB_/.test(GM_getValue(keys[k])))
                GM_deleteValue(keys[k]);
        }
    }
    function cmd_blockChosen()
    {
        var selector = (prompt("enter selector"));
        blockCookieNode(getElementBySelector(selector));
    }
    function getSelector(node) // node has to be in document (has to been not removed yet)
    {
        var selector = null;
        if(node.id)
        {
            selector = '#'+node.id;
        }
        else if(node.className)
        {
            var classes = node.className; // when more than one class then className == 'xxxx xxxxx xx'
            var nodes=document.getElementsByClassName(classes);
            if(nodes.length == 1)
                selector = '.'+classes;
            else
                selector = null;
        }
        else
            selector = null;
        return selector;
    }
    function getElementBySelector(selector)
    {
        switch(selector[0])
        {
        case '#':
            var elem = document.getElementById(selector.substr(1));
            if(elem === null)
                return "no_elements";
            else
                return elem;
            break;
        case '.':
            // IE>=9
            var nodes=document.getElementsByClassName(selector.substr(1));
            if(nodes.length > 0)
                return nodes[0];
            else
                return "will_be_no_elements";
            break;
        }
    }
    function isMatchesToSelector(node, selector)
    {
        switch(selector[0])
        {
        case '#':
            var selector_id = selector.substr(1);
            if ((typeof node.id !== 'undefined') && (node.id.indexOf(selector_id) > -1))
                return true;
            else
                return false;
            break;
        case '.':
            var selector_class = selector.substr(1);
            if ((typeof node.className !== 'undefined') && (node.className.indexOf(selector_class) > -1)) // classname "aaa bb" will be matched to selector.substr(1):"aaa"
                return true;
            else
                return false;
            break;
        }
    }
    var cookie_ids = [/cook|alert|popup/i];
    function isCookieLabeled_weaker(node)
    {
        if( cookie_ids[0].test(node.id) ||
            cookie_ids[0].test(node.className) )
            return true;
        else
            return false;
    }
    function isCookieLabeled_stronger(node)
    {
        if( /cookie/i.test(node.id) ||
            /cookie/i.test(node.className) )
            return true;
        else
            return false;
    }
    function getContent(node)
    {
        var node_text;
        if(node.nodeName.toUpperCase() === 'IFRAME')
        {
            try {
                node_text = node.contentWindow.document.body.textContent;
            }
            catch(e) {
                node_text = '';
            }
        }
        else
            node_text = node.textContent;
        return node_text;
    }
    function isCookieContent(node_content)
    {
        var cookie_words = COOKIE_WORDS[LANG];
        for (var i=0, cookie_words_length=cookie_words.length ; i<cookie_words_length ; i++)
            if( !cookie_words[i].test(node_content) )
                return false;
        if (FOOTER_WORDS[LANG][0].test(node_content))
            return false;
        // else:    
        return true;
    }
    function isCookieLength(node_content)
    {
        if( node_content.length > COOKIE_LENGTHS[LANG][0] &&
            node_content.length < COOKIE_LENGTHS[LANG][1] )
            return true;
        else
            return false;
    }
    function blockCookieNode(_node)
    {
        window.CPB_is_blocked = true;
        var style_obj={};
        for(var attr in _node.style)
            if(_node.style[attr] != '')
                style_obj[attr] = _node.style[attr];
        GM__changeJsonAttr(window.location.hostname, 'css', getCssSelector(_node));
        GM__changeJsonAttr(window.location.hostname, 'text', getContent(_node));
        GM__changeJsonAttr(window.location.hostname, 'blocked', window.CPB_is_blocked);
        GM__changeJsonAttr(window.location.hostname, 'tag_name', _node.nodeName);
        GM__changeJsonAttr(window.location.hostname, 'style', JSON.stringify(style_obj)); // JSON - IE>=8
        var selector_prev = ((typeof (localStorage.getItem('CPB_COOKIE_NODE')) !== 'undefined') ?localStorage.getItem('CPB_COOKIE_NODE') :null); // getitem returns null if nothing is found (http://dev.w3.org/html5/webstorage/#dom-storage-getitem)
        if( selector_prev===null || !isMatchesToSelector(_node, selector_prev) )
        {
            var selector = getSelector(_node);
            if(selector !== null)
                localStorage.setItem('CPB_COOKIE_NODE', selector);
        }
        window.CPB_blocked_parent_node = _node.parentNode;
        window.CPB_replacing_node = document.createElement("div");
        window.CPB_blocked_node = _node.parentNode.replaceChild(window.CPB_replacing_node, _node); // block node
        window.CPB_replacing_node.id = 'CPB_REPLACING_NODE';
    }
    function unblockCookieNode()
    {
        window.CPB_blocked_parent_node.replaceChild(window.CPB_blocked_node, window.CPB_replacing_node);
        window.CPB_is_blocked = false;
        if(typeof localStorage !== 'undefined' && typeof localStorage !== 'null')
            localStorage.removeItem('CPB_COOKIE_NODE');
        GM__changeJsonAttr(window.location.hostname, 'blocked', window.CPB_is_blocked);
    }
    var scanned =[];
    // runed at document.body has been loaded (root_node=document.body) or it is inserted node to doc after doc loaded
    function scanAndBlock(root_node)
    {
        var wanted_nodes = ["DIV","IFRAME","P"];
        var node_content, node_curr;
        var nodes = getNodesInTreeByNodeName(root_node, wanted_nodes);
        for (var node_i = 0, nodes_length = nodes.length; node_i < nodes_length ; )
        {
            node_curr = nodes[node_i];
            var is_dup = false;
            for (var j=0, scanned_length=scanned.length ; j<scanned_length ; j++)
                if(node_curr === scanned[j])
                {
                    is_dup = true;
                    break;
                }
            if (is_dup)
                console.log('this node has been already scanned.\n'+getCssSelector(node_curr)+'\n\n'+node_curr.textContent.substr(0, 100));
            else
                scanned.push(node_curr);
            // initial filter
            if( node_i < 7 ||
                nodes.length-1 - node_i < 11 ||
                isCookieLabeled_weaker(node_curr) )
            {
                node_content = getContent(node_curr);
                if ( isCookieLength(node_content) )
                {
                    if ( isCookieContent(node_content) )
                    {
                        // prevent interpret as cookie node  parent of cookie node
                        var node_childs = ((typeof (node_curr.getElementsByTagName('div')) !== 'undefined') ?node_curr.getElementsByTagName('div') :[]);
                        for (var i=0, node_childs_length=node_childs.length ; i<node_childs_length ; i++)
                            if(isCookieLabeled_stronger(node_childs[i]))
                            {
                                if(isCookieContent(node_childs[i].textContent))
                                    node_curr = node_childs[i];
                                break;
                            }
                        blockCookieNode(node_curr);
                        return;
                    }
                    else // hasn't cookiecontent? skip all descendants 
                    {
                        do
                        {
                            node_i++;
                        } while (typeof nodes[node_i+1] !== 'undefined' && isDescendant(node_curr, nodes[node_i+1]));
                        continue;
                    }
                }
                else
                {
                    node_i++;
                    continue;
                }
            }
            else
            {
                node_i++;
                continue;
            }
        }
    }
    function callOneTimeOnTitleExist(callback)
    {
        var head = document.getElementsByTagName("head")[0];
        if( head.getElementsByTagName("title").length > 0 ) // i.e.:  if (title node exists) 
        {
            if(document.title.length > 0)
                callback();
            else // if title is added by script (don't know if necessary)
            {
                var title_node = head.getElementsByTagName("title")[0];
                var title_observer = new MUTATIONOBSERVER(
                    function(mutations, observer)
                    {
                        callback();
                        observer.disconnect();
                        return;
                    }
                );
                title_observer.observe(
                    title_node,
                    { subtree: true, characterData:true, childList: true, attributes: true }
                );
            }
        }
        else
        {
            var title_observer = new MUTATIONOBSERVER(
                function(mutations, observer)
                {
                    for (var k=0, mutations_length=mutations.length ; k<mutations_length ; k++)
                    {
                        if(mutations[k].type === 'childList')
                        {
                            var added_nodes = mutations[k].addedNodes;
                            for (var i=0, added_nodes_length=added_nodes.length ; i<added_nodes_length ; i++)
                            {
                                if(added_nodes[i].nodeName === 'TITLE')
                                {
                                    callback();
                                    observer.disconnect();
                                    return;
                                }
                            }
                        }
                    }
                }
            );
            title_observer.observe(
                head,
                { subtree: true, childList: true }
            );
        }
    }
    function callWhenPageAboutCookies(callback)
    {
        if(COOKIE_TITLES[LANG].test(window.location.href))
            callback();
        else
            callOneTimeOnTitleExist(
                function()
                {
                    if(COOKIE_TITLES[LANG].test(document.title))
                        callback();
                }
            );
    }
    function huntCookieNode_start()
    {
        function dom_listener(mutations, observer)
        {
            for (var i=0, mutations_length=mutations.length ; i<mutations_length ; i++)
            {
                var added_nodes = mutations[i].addedNodes;
                if(added_nodes)
                    for(var node_i = 0, added_nodes_length = added_nodes.length; node_i < added_nodes_length ; node_i++)
                    {
                        node_curr = added_nodes[node_i];
                        if(window.CPB_is_blocked || window.CPB_page_about_cookies)
                        {
                            observer.disconnect();
                            return;
                        }
                        scanAndBlock( node_curr );
                        if(window.CPB_is_blocked)
                            unblockWhenPageAboutCookies();
                        // Is below necessary ??
                        // do // skip all descendants - they are scaned in scanAndBlock
                        // {
                            // node_i++;                           
                        // } while ( typeof added_nodes[node_i+1] !== 'undefined' && isDescendant(node_curr, added_nodes[node_i+1]) );                        
                    }
            }
        }
        var doc_observer = new MUTATIONOBSERVER(dom_listener);
        doc_observer.observe(document, {childList : true, subtree: true});
    }
    function startHuntMatchedCookieNode()
    {
        function dom_listener(mutations, observer)
        {
            for (var i=0, mutations_length=mutations.length ; i<mutations_length ; i++)
            {
                var added_nodes = mutations[i].addedNodes;
                if(added_nodes)
                    for (var node_i=0, added_nodes_length=added_nodes.length ; node_i<added_nodes_length ; node_i++)
                    {
                        node_curr = added_nodes[node_i];
                        if( isMatchesToSelector(node_curr, window.CPB_cookie_node_selector) )
                        {
                            blockCookieNode(node_curr);
                            observer.disconnect();
                            return;
                        }
                    }
            }
        }
        var doc_observer = new MUTATIONOBSERVER(dom_listener);
        doc_observer.observe(document, {childList : true, subtree: true});
        return doc_observer;
    }
    function unblockWhenPageAboutCookies()
    {
        callWhenPageAboutCookies(
            function()
            {
                PAGE_ABOUT_COKIES = true;
                unblockCookieNode();
                GM__changeJsonAttr(window.location.hostname, 'info', 'PAGE_ABOUT_COKIES');
            }
        );
    }
    function searchCookieNode_init()
    {
        callWhenPageAboutCookies(
            function() {
                PAGE_ABOUT_COKIES = true;
                GM__changeJsonAttr(window.location.hostname, 'info', 'PAGE_ABOUT_COKIES');
            }
        );
    }
    function searchCookieNode_now()
    {
        if( !PAGE_ABOUT_COKIES )
        {
            scanAndBlock(document.body);
            if(window.CPB_is_blocked)
                unblockWhenPageAboutCookies();
        }
    }
    ////////////////////////////////////////////////////
    //  Start main script instructions
    ////////////////////////////////////////////////////
    debugger;
    //// Default values
    window.CPB_is_blocked = null;
    window.CPB_page_about_cookies = null; // due detecting "cookie popup" is simplified, on many pages about cookies there is detected "false positive", so on these pages we are don't try block any popups
    GM_setValue(window.location.hostname, JSON.stringify({'css':'', 'text':'', 'blocked':false, 'tag_name':null, 'info':'-', 'style':'', 'lang':LANG})); // default values in log record
    // localStorage: IE >= 8, FF: dom.storage.enabled has to be enabled
    var is_storage_support = ! ((typeof(Storage)==="undefined") || (localStorage === null));
    if ( is_storage_support && localStorage.getItem('CPB_COOKIE_NODE') ) // if (it is saved a cookie identifier)
    {
        window.CPB_cookie_node_selector = localStorage.getItem('CPB_COOKIE_NODE') ;
        var matched_cookie_node_observer = startHuntMatchedCookieNode();
        ((typeof document.addEventListener !== 'undefined') ?document.addEventListener :document.attachEvent)(
            'readystatechange',
            function()
            {
                if(document.readyState === 'interactive') // if(html is loaded)
                {
                    var node = getElementBySelector(window.CPB_cookie_node_selector);
                    if(node === "will_be_no_elements")
                    {
                    // change from blocking cookie mode from cache  to searching cookie node 
                        matched_cookie_node_observer.disconnect();
                        searchCookieNode_init();
                        huntCookieNode_start();
                        GM__changeJsonAttr(window.location.hostname, 'info', 'FROM_CACHE_TO_SEARCHING_MODE');
                        searchCookieNode_now();
                    }
                    else if(node !== "no_elements")
                    {
                        blockCookieNode(node);
                    }
                }
                else if(document.readyState === 'complete' && !window.CPB_is_blocked) // if (all page elements are loaded and nothing has been blocked yet)
                {
                // change from blocking cookie mode from cache  to searching cookie node 
                    matched_cookie_node_observer.disconnect();
                    searchCookieNode_init();
                    huntCookieNode_start();
                    GM__changeJsonAttr(window.location.hostname, 'info', 'FROM_CACHE_TO_SEARCHING_MODE');
                    searchCookieNode_now();
                }
            },
            /*useCapture = */ true
        );
        GM__changeJsonAttr(window.location.hostname, 'info', 'CACHE_MODE');
    }
    else // if (cookie identifier isn't available)
    {
        GM__changeJsonAttr(window.location.hostname, 'info', 'SEARCHING_MODE');
        searchCookieNode_init();
        huntCookieNode_start();
        // Search for cookie node in document when will be loaded
        ((typeof document.addEventListener !== 'undefined') ?document.addEventListener :document.attachEvent)(
            'readystatechange',
            function()
            {
                if(document.readyState === 'interactive' && !window.CPB_is_blocked )
                {
                    searchCookieNode_now();
                }
            },
            /*useCapture = */ true
        );
        if( !is_storage_support )
            console.error("access to localStorage failed");
    }
    ((typeof document.addEventListener !== 'undefined') ?document.addEventListener :document.attachEvent)(
        'readystatechange',
        function()
        {
            if(document.readyState === 'complete')
            {
                GM__changeJsonAttr(window.location.hostname, 'cookie_found', /cookie/i.test(document.body.textContent));
            }
        }
    );
    GM_registerMenuCommand("Show logs", cmd_showLogs);
    GM_registerMenuCommand("Send and clear logs", function(){cmd_sendLogs();cmd_clearLogs();});
    GM_registerMenuCommand("Unblock node", unblockCookieNode);
    GM_registerMenuCommand("Block chosen node", cmd_blockChosen);
}
