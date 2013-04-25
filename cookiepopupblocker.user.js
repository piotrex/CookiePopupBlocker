﻿#define DEBUG 0

# // due log/debug information are sometimes overwrite so it is useful sending them to database immediately (however AUTO_SEND_LOGS isn't fully working)
#define AUTO_SEND_LOGS 0

# // for debug - not auto block (e.g. manually)
#define DO_NOT_TRY_BLOCK_ANYTHING 0

#define __YEAR__ 2013

#if DEBUG==1
#define DEBUGGER debugger;
#elif DEBUG==0
#define DEBUGGER  
#endif

#define SHOW_WHEN(x,when_is) (  ((x)==when_is) ?(alert(#x + "\n==\n" + #when_is),(x)) :(x)  )
#define IF_DEFINED(x,default) ((typeof (x) !== 'undefined') ?x :default)
# // http://jsperf.com/browser-diet-cache-array-length/10
#define FOR_EACH(array,counter) for (var counter=0, array ## _length=array.length ; counter<array ## _length ; counter++)

// ==UserScript==
// @name           CookiePopupBlocker
// @version        1.4.3
// @description    Blokuje banery z informacją o używaniu przez witrynę cookies
// @run-at         document-start
// @namespace      https://github.com/piotrex
// @include        *
#if MAKE_LOGS==0
// @grant          none
#elif MAKE_LOGS==1
// @grant          GM_listValues
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_registerMenuCommand
#endif
#if DEBUG==1
// @grant          GM_registerMenuCommand
#endif
#if MAKE_LOGS==1
// @downloadURL    https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-logs.user.js
// @updateURL      https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-logs.user.js
#elif MAKE_LOGS==0
// @downloadURL    https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-no_logs.user.js
// @updateURL      https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-no_logs.user.js
#endif
// @homepage       https://github.com/piotrex/CookiePopupBlocker
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @icon           https://raw.github.com/piotrex/CookiePopupBlocker/master/icon/32x32.png
// ==/UserScript==

var LANG = "pl"; // for now: only one language can be setted
var COOKIE_TITLES = {
    "pl":/cookie|ciastecz/i
};
var COOKIE_WORDS = { // ',' - means conjunction, '|' - disjunction
    "pl": [/cookie|ciastecz/i, /u(ż|z)ywa|korzyst|stosuje|pos(ł|l)ugu/i, /stron|witryn|serwis|portal|jemy/i,/(wiedzie|wi(ę|e)cej|informacj|szczeg|polity|czym s(ą|a)|przegl(a|ą)dar)|(akcept|zgod)/i]
};
var FOOTER_WORDS = {
    "pl": [/©|copyright|creative|zastrzeżone/i] /* "creative commons", "wszelkie prawa zastrzeżone" */ 
}; 
var COOKIE_LENGTHS = {// lowest and highest length of textContent of cookie node popup 
    "pl": [100,1000]
};
    

# // addEventListener: IE >= 9
#define ADD_EVENT_LISTENER(OBJ) ((typeof OBJ.addEventListener !== 'undefined') ?OBJ.addEventListener :OBJ.attachEvent)
    
#define IS_BLOCKED window.CPB_is_blocked
#define PAGE_ABOUT_COOKIES window.CPB_page_about_cookies
#define BLOCKED_NODE window.CPB_blocked_node
#define BLOCKED_PARENT_NODE window.CPB_blocked_parent_node
#define REPLACING_NODE window.CPB_replacing_node
#define COOKIE_NODE_SELECTOR window.CPB_cookie_node_selector

// FF >=14 CHR >=18
var MUTATIONOBSERVER = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

if(window.self === window.top)
{
    ////////////////////////////////////////////////////
    //  General functions
    ////////////////////////////////////////////////////

    #if MAKE_LOGS==1 || DEBUG==1

    #define STORAGE_URL "https://script.google.com/macros/s/AKfycbyfPf_UT7Dndf7Z_FPvUIC-eIwhS8jijQDuugp2bk3gmhSS8Zbu/exec"
    
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
        FOR_EACH(_data,i) 
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
    #endif
    
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
                FOR_EACH(childs,i)
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
    
    #if MAKE_LOGS==1
    function getLogsArray()
    {
        var values_names = GM_listValues();
        var log_name;
        var log_array = [];
        var log_record;
        FOR_EACH(values_names,i)
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
        XDomainOneWayPOST(STORAGE_URL,[{name:"records",value:JSON.stringify(getLogsArray())}]);
    }
    function cmd_clearLogs()
    {
        var keys = GM_listValues();
        FOR_EACH(keys,k)
        {
            if(! /^CPB_/.test(GM_getValue(keys[k])))
                GM_deleteValue(keys[k]);
        }
    }    
    #endif
    #if DEBUG==1
    function cmd_blockChosen()
    {
        var selector = (prompt("enter selector"));
        blockCookieNode(getElementBySelector(selector));
    }   
    #endif
    
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
        if(node.nodeName.toUpperCase()  === 'IFRAME')
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
        FOR_EACH(cookie_words,i)
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
        IS_BLOCKED = true;
    
    #if MAKE_LOGS==1
        var style_obj={};
        for(var attr in _node.style)
            if(_node.style[attr] != '')
                style_obj[attr] = _node.style[attr];
            
        GM__changeJsonAttr(window.location.hostname, 'css', getCssSelector(_node));
        GM__changeJsonAttr(window.location.hostname, 'text', getContent(_node));
        GM__changeJsonAttr(window.location.hostname, 'blocked', IS_BLOCKED);
        GM__changeJsonAttr(window.location.hostname, 'tag_name', _node.nodeName);
        GM__changeJsonAttr(window.location.hostname, 'style', JSON.stringify(style_obj));  // JSON - IE>=8
    #endif
    
        var selector_prev = IF_DEFINED(localStorage.getItem('CPB_COOKIE_NODE'),null); // getitem returns null if nothing is found (http://dev.w3.org/html5/webstorage/#dom-storage-getitem)
        if( selector_prev===null || !isMatchesToSelector(_node, selector_prev) )
        {
            var selector = getSelector(_node);
            if(selector !== null)
                localStorage.setItem('CPB_COOKIE_NODE', selector);
        }
        
        BLOCKED_PARENT_NODE = _node.parentNode;
        REPLACING_NODE = document.createElement("div");
        BLOCKED_NODE = _node.parentNode.replaceChild(REPLACING_NODE, _node); // block node
        REPLACING_NODE.id = 'CPB_REPLACING_NODE';
    }   
    
    function unblockCookieNode()
    {
        BLOCKED_PARENT_NODE.replaceChild(BLOCKED_NODE, REPLACING_NODE);
        IS_BLOCKED = false;
        
        if(typeof localStorage !== 'undefined' && typeof localStorage !== 'null')
            localStorage.removeItem('CPB_COOKIE_NODE');
        
    #if MAKE_LOGS==1
        GM__changeJsonAttr(window.location.hostname, 'blocked', IS_BLOCKED);
    #endif
    }
   
    
    #if DEBUG==1
    var scanned =[];
    #endif    
    // runed at document.body has been loaded (root_node=document.body) or it is inserted node to doc after doc loaded
    function scanAndBlock(root_node)
    {
        var wanted_nodes = ["DIV","IFRAME","P"];
        var node_content, node_curr;
        
        var nodes = getNodesInTreeByNodeName(root_node, wanted_nodes);
        for (var node_i = 0, nodes_length = nodes.length; node_i < nodes_length ; )
        {
            node_curr = nodes[node_i];
        #if DEBUG==1
            var is_dup = false;
            FOR_EACH(scanned,j)
                if(node_curr === scanned[j])
                {
                    is_dup  = true;
                    break;
                }
            if (is_dup)
                console.log('this node has been already scanned.\n'+getCssSelector(node_curr)+'\n\n'+node_curr.textContent.substr(0, 100)); 
            else
                scanned.push(node_curr);
        #endif
            
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
                        var node_childs = IF_DEFINED(node_curr.getElementsByTagName('div'),[]);
                        FOR_EACH(node_childs,i)
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
                    FOR_EACH(mutations,k)
                    {
                        if(mutations[k].type === 'childList')
                        {
                            var added_nodes = mutations[k].addedNodes;
                            FOR_EACH(added_nodes,i)
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
            FOR_EACH(mutations,i)
            {
                var added_nodes = mutations[i].addedNodes;
                if(added_nodes)
                    for(var node_i = 0, added_nodes_length = added_nodes.length; node_i < added_nodes_length ; node_i++)
                    {
                        node_curr = added_nodes[node_i];
                        if(IS_BLOCKED || PAGE_ABOUT_COOKIES)
                        {
                            observer.disconnect();
                            return;
                        }
                        
                        scanAndBlock( node_curr );
                        if(IS_BLOCKED)
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
            FOR_EACH(mutations,i)
            {
                var added_nodes = mutations[i].addedNodes;
                if(added_nodes)
                    FOR_EACH(added_nodes,node_i)
                    {
                        node_curr = added_nodes[node_i];
                        
                        if( isMatchesToSelector(node_curr, COOKIE_NODE_SELECTOR) )
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
                PAGE_ABOUT_COOKIES = true;
                unblockCookieNode();
            #if MAKE_LOGS==1    
                GM__changeJsonAttr(window.location.hostname, 'info', 'PAGE_ABOUT_COOKIES');
            #endif                    
            #if MAKE_LOGS==1 && AUTO_SEND_LOGS==1
                cmd_sendLogs();cmd_clearLogs();
            #endif
            }
        );
    }
    
    function searchCookieNode_init()
    {
        callWhenPageAboutCookies(
            function() {
                PAGE_ABOUT_COOKIES = true;
            #if MAKE_LOGS==1    
                GM__changeJsonAttr(window.location.hostname, 'info', 'PAGE_ABOUT_COOKIES');
            #endif 
            }
        );
    }
    
    function searchCookieNode_now()
    {
        if( !PAGE_ABOUT_COOKIES ) 
        {
            scanAndBlock(document.body);
            if(IS_BLOCKED)
                unblockWhenPageAboutCookies();
        }
    }
       
    ////////////////////////////////////////////////////
    //  Start main script instructions
    ////////////////////////////////////////////////////
    DEBUGGER
    //// Default values
    IS_BLOCKED = null;
    PAGE_ABOUT_COOKIES = null; // due detecting "cookie popup" is simplified, on many pages about cookies there is detected "false positive", so on these pages we are don't try block any popups
    #if MAKE_LOGS==1
    GM_setValue(window.location.hostname, JSON.stringify({'css':'', 'text':'', 'blocked':false, 'tag_name':null, 'info':'-', 'style':'', 'lang':LANG})); // default values in log record
    #endif
       
    
    #if DO_NOT_TRY_BLOCK_ANYTHING==0
    // localStorage: IE >= 8, FF: dom.storage.enabled has to be enabled
    var is_storage_support = ! ((typeof(Storage)==="undefined") || (localStorage === null));
    
    if ( is_storage_support && localStorage.getItem('CPB_COOKIE_NODE') ) // if (it is saved a cookie identifier)
    {
        COOKIE_NODE_SELECTOR = localStorage.getItem('CPB_COOKIE_NODE') ;
        
        var matched_cookie_node_observer = startHuntMatchedCookieNode();
        
        ADD_EVENT_LISTENER(document)(
            'readystatechange', 
            function()
            {
                if(document.readyState === 'interactive') // if(html is loaded)
                {
                    var node = getElementBySelector(COOKIE_NODE_SELECTOR);
                    if(node === "will_be_no_elements")
                    {
                    // change from blocking cookie mode from cache  to searching cookie node 
                        matched_cookie_node_observer.disconnect();
                        searchCookieNode_init();
                        huntCookieNode_start();
                    #if MAKE_LOGS==1
                        GM__changeJsonAttr(window.location.hostname, 'info', 'FROM_CACHE_TO_SEARCHING_MODE');
                    #endif
                        searchCookieNode_now();
                    }                    
                    else if(node !== "no_elements")
                    {
                        blockCookieNode(node);
                    #if MAKE_LOGS==1 && AUTO_SEND_LOGS==1
                        cmd_sendLogs();cmd_clearLogs();
                    #endif
                    }
                }
                else if(document.readyState === 'complete' && !IS_BLOCKED) // if (all page elements are loaded and nothing has been blocked yet)
                {
                // change from blocking cookie mode from cache  to searching cookie node 
                    matched_cookie_node_observer.disconnect();
                    searchCookieNode_init();
                    huntCookieNode_start();
                #if MAKE_LOGS==1
                    GM__changeJsonAttr(window.location.hostname, 'info', 'FROM_CACHE_TO_SEARCHING_MODE');
                #endif
                    searchCookieNode_now();
                }
            }, 
            /*useCapture = */ true
        );
        
        #if MAKE_LOGS==1
        GM__changeJsonAttr(window.location.hostname, 'info', 'CACHE_MODE');
        #endif
    }
        
    else // if (cookie identifier isn't available)
    {
    #if MAKE_LOGS==1
        GM__changeJsonAttr(window.location.hostname, 'info', 'SEARCHING_MODE');
    #endif
        
        searchCookieNode_init();
        huntCookieNode_start();
        
        // Search for cookie node in document when will be loaded
        ADD_EVENT_LISTENER(document)(
            'readystatechange', 
            function()
            {
                if(document.readyState === 'interactive' && !IS_BLOCKED )
                {
                    searchCookieNode_now();
                }
            }, 
            /*useCapture = */ true
        );
        
        if( !is_storage_support )
            console.error("access to localStorage failed");  
    }
    #endif
    
    #if MAKE_LOGS==1
    ADD_EVENT_LISTENER(document)(
        'readystatechange', 
        function()
        {
            if(document.readyState === 'complete')
            {
                GM__changeJsonAttr(window.location.hostname, 'cookie_found', /cookie/i.test(document.body.textContent));
            }
        }
    );
    #endif
    
    #if MAKE_LOGS==1
    GM_registerMenuCommand("Show logs", cmd_showLogs);
    GM_registerMenuCommand("Send and clear logs", function(){cmd_sendLogs();cmd_clearLogs();});
    #endif
    
    #if DEBUG==1
    GM_registerMenuCommand("Unblock node", unblockCookieNode);
    GM_registerMenuCommand("Block chosen node", cmd_blockChosen);
    #endif
}
