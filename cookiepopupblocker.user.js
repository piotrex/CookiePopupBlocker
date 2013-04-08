﻿#define DEBUG 0


#define __YEAR__ 2013

#if DEBUG==1
#define DEBUGGER debugger;
#elif DEBUG==0
#define DEBUGGER  
#endif

#define IF_DEFINED(x,default) ((typeof (x) !== 'undefined') ?x :default)
#define SHOW_WHEN(x,when_is) (  ((x)==when_is) ?(alert(#x + "=\n\n" + String(x)),(x)) :(x)  )
// http://jsperf.com/browser-diet-cache-array-length/10
#define FOR_EACH(array,counter) for (var counter=0, array ## _length=array.length ; counter<array ## _length ; counter++)

// ==UserScript==
// @name           CookiePopupBlocker
// @version        1.2.2
// @description    Blokuje banery z informacją o używaniu przez witrynę cookies
// @run-at         document-start
// @namespace      https://github.com/piotrex
#if DEBUG==1 || MAKE_LOGS==1
// @include        *
#else
// @include        http://*.pl*
// @include        https://*.pl*
#endif
#if MAKE_LOGS==0
// @grant          none
#elif MAKE_LOGS==1
// @grant          GM_listValues
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_registerMenuCommand
#endif
#if MAKE_LOGS==1
// @downloadURL    https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-logs.user.js
// @updateURL      https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-logs.user.js
#elif MAKE_LOGS==0
// @downloadURL    https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-no_logs.user.js
// @updateURL      https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-no_logs.user.js
#endif
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @icon           https://raw.github.com/piotrex/CookiePopupBlocker/master/icon/32x32.png
// ==/UserScript==

#define BLOCKED window.CPB_blocked_ed5gdg7f
BLOCKED = null;
if(window.self === window.top)
{
    ////////////////////////////////////////////////////
    //  General functions
    ////////////////////////////////////////////////////

    #if MAKE_LOGS==1 || DEBUG==1

    #define STORAGE_URL "https://script.google.com/macros/s/AKfycbyfPf_UT7Dndf7Z_FPvUIC-eIwhS8jijQDuugp2bk3gmhSS8Zbu/exec"
    
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
            if(! /^CBP_/.test(GM_getValue(keys[k])))
                GM_deleteValue(keys[k]);
        }
    }    
    #endif
    
    var cookie_ids = [/cook/i];
    function isCookieLabeled_stronger(node)
    {
        if( cookie_ids[0].test(node.id) ||
            cookie_ids[0].test(node.className) )
            return true;
        else
            return false;
    }
    function isCookieLabeled_weaker(node)
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
                node_text = node.contentDocument.body.textContent;
            }
            catch(e) {
                node_text = '';
            }
        }               
        else
            node_text = node.textContent;
            
        return node_text;
    }
    
    var cookie_words = [/cookie|ciastecz/i, /u(ż|z)ywa|korzyst|stosuje|pos(ł|l)ugu/i, /wiedzie|wi(ę|e)cej|informacj|szczeg|polity|akcept|zgod|czym s(ą|a)|przegl(a|ą)dark/i];
    var footer_words = [/©|copyright|creative/i]; /* "creative commons" */
    function isCookieContent(node_content)
    {
        if( cookie_words[0].test(node_content) && 
            cookie_words[1].test(node_content) && 
            cookie_words[2].test(node_content) )
        {       
            if (footer_words[0].test(node_content)) 
                return false;
            else
                return true;
        }
        else
            return false;
    }
    function isCookieLength(node_content)
    {
        if( node_content.length > 100 &&
            node_content.length < 1000 )
            return true;
        else
            return false;
    }
    
    function blockCookieNode(node)
    {
    #if MAKE_LOGS==1
        GM_setValue(window.location.hostname, JSON.stringify({css:getCssSelector(node), text:IF_DEFINED(node.textContent,''), blocked:true, tag_name: node.nodeName}));
        cmd_sendLogs();
        cmd_clearLogs();                    
    #endif
        
        node.parentNode.removeChild(node);          
        BLOCKED = true;
    }   
    
    #if DEBUG==1
    var scanned =[];
    #endif    
    // runed at document.body has been loaded (root_node=document.body) or it is inserted node to doc after doc loaded
    function scanAndBlock(root_node)
    {
        var wanted_nodes = ["DIV","IFRAME"];
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
            if( node_i < 5 || // initial filter
                nodes.length-1 - node_i < 10 || 
                isCookieLabeled_weaker(node_curr) )
            {
                if (isCookieLabeled_stronger(node_curr))
                {
                    blockCookieNode(node_curr);
                    return;
                }               
                // else:
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
                    else // hasn't cookiecontent? skip all descendats 
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
    
    
    ////////////////////////////////////////////////////
    //  Start main script instructions
    ////////////////////////////////////////////////////
    
    #if MAKE_LOGS==1
    GM_setValue(window.location.hostname, JSON.stringify({'css':'', 'text':'', 'blocked':false, 'tag_name':null}));
    #endif
    
    // var interval = 500;
    // var repeating_time = 10000;
    // var next_time = 0;
    // function trigger() 
    // {
        // next_time += interval;
        // if (BLOCKED!==true && next_time < repeating_time && document.readyState !== 'complete')
            // setTimeout(trigger, interval);
    // }    
    //setTimeout(trigger,   interval);
    
    function dom_listener(mutations, observer)
    {
        FOR_EACH(mutations,i)
        {
            var added_nodes = mutations[i].addedNodes;
            if(added_nodes)
                for(var node_i = 0, added_nodes_length = added_nodes.length; node_i < added_nodes_length ; node_i++)
                {
                    node_curr = added_nodes[node_i];
                    if(BLOCKED)
                    {
                        observer.disconnect();
                        return;
                    }
                    
                    scanAndBlock( node_curr );
                    
                    // Is below necessary ??
                    // do // skip all descendats - they are scaned in scanAndBlock
                    // {
                        // node_i++;                           
                    // } while ( typeof added_nodes[node_i+1] !== 'undefined' && isDescendant(node_curr, added_nodes[node_i+1]) );                        
                }           
        }
    }
    
    var observer = new MutationObserver(dom_listener);      
    observer.observe(document, {childList : true, subtree: true});
    
    document.addEventListener(
        'readystatechange', 
        function()
        {
            if(document.readyState === 'interactive')
            {
                if( ! BLOCKED )
                    scanAndBlock(document.body);
            }
        }, 
        /*useCapture = */ true
    );
    
    #if MAKE_LOGS==1
    document.addEventListener(
        'readystatechange', 
        function()
        {
            if(document.readyState === 'complete')
            {
                var storage_log = JSON.parse(GM_getValue(window.location.hostname, {}));
                storage_log['cookie_found'] = /cookie/i.test(document.body.textContent);
                GM_setValue(window.location.hostname, JSON.stringify(storage_log));
            }
        }
    );
    #endif
    
    #if MAKE_LOGS==1
    
    GM_registerMenuCommand("Show logs", cmd_showLogs);
    GM_registerMenuCommand("Send and clear logs", function(){cmd_sendLogs();cmd_clearLogs();});
    
    #endif
}
