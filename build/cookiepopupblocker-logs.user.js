// http://jsperf.com/browser-diet-cache-array-length/10
// ==UserScript==
// @name           CookiePopupBlocker
// @version        1.3.0
// @description    Blokuje banery z informacją o używaniu przez witrynę cookies
// @run-at         document-start
// @namespace      https://github.com/piotrex
// @include        *
// @grant          GM_listValues
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_registerMenuCommand
// @downloadURL    https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-logs.user.js
// @updateURL      https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-logs.user.js
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @icon           https://raw.github.com/piotrex/CookiePopupBlocker/master/icon/32x32.png
// ==/UserScript==
window.CPB_is_blocked_ed5g = null;
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
            if(! /^CBP_/.test(GM_getValue(keys[k])))
                GM_deleteValue(keys[k]);
        }
    }
    function isSiteAboutCookies()
    {
        if(/cookie|ciastecz/i.test(document.title))
            return true;
        else
            return false;
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
    var cookie_words = [/cookie|ciastecz/i, /u(ż|z)ywa|korzyst|stosuje|pos(ł|l)ugu/i, /stron|witryn|serwis|portal|jemy/i,/wiedzie|wi(ę|e)cej|informacj|szczeg|polity|akcept|zgod|czym s(ą|a)|przegl(a|ą)dar/i];
    var footer_words = [/©|copyright|creative|zastrzeżone/i]; /* "creative commons", "wszelkie prawa zastrzeżone" */
    function isCookieContent(node_content)
    {
        if( cookie_words[0].test(node_content) &&
            cookie_words[1].test(node_content) &&
            cookie_words[2].test(node_content) &&
            cookie_words[3].test(node_content) )
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
    function blockCookieNode(_node)
    {
        window.CBP_blocked_parent_node_hf7r = _node.parentNode;
        window.CBP_replacing_node_j8F4 = document.createElement("div");
        window.CBP_replacing_node_j8F4.id = 'CPB_REPLACING_NODE';
        window.CBP_blocked_node_gT6E = _node.parentNode.replaceChild(window.CBP_replacing_node_j8F4, _node);
        window.CPB_is_blocked_ed5g = true;
        GM_setValue(window.location.hostname, JSON.stringify({css:getCssSelector(_node), text:getContent(_node), blocked:window.CPB_is_blocked_ed5g, tag_name: _node.nodeName, info:'-'}));
        // JSON - IE>=8
    }
    function unblockCookieNode()
    {
        window.CBP_blocked_parent_node_hf7r.replaceChild(window.CBP_blocked_node_gT6E, window.CBP_replacing_node_j8F4);
        window.CPB_is_blocked_ed5g = false;
        GM__changeJsonAttr(window.location.hostname, 'info', 'PAGE_ABOUT_COKIES');
        GM__changeJsonAttr(window.location.hostname, 'blocked', window.CPB_is_blocked_ed5g);
        cmd_sendLogs();
        cmd_clearLogs();
    }
    // runed at document.body has been loaded (root_node=document.body) or it is inserted node to doc after doc loaded
    function scanAndBlock(root_node)
    {
        var wanted_nodes = ["DIV","IFRAME","P"];
        var node_content, node_curr;
        var nodes = getNodesInTreeByNodeName(root_node, wanted_nodes);
        for (var node_i = 0, nodes_length = nodes.length; node_i < nodes_length ; )
        {
            node_curr = nodes[node_i];
            if( node_i < 7 || // initial filter
                nodes.length-1 - node_i < 11 ||
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
    ////////////////////////////////////////////////////
    //  Start main script instructions
    ////////////////////////////////////////////////////
    GM_setValue(window.location.hostname, JSON.stringify({'css':'', 'text':'', 'blocked':false, 'tag_name':null, 'info':'-'}));
    function dom_listener(mutations, observer)
    {
        for (var i=0, mutations_length=mutations.length ; i<mutations_length ; i++)
        {
            var added_nodes = mutations[i].addedNodes;
            if(added_nodes)
                for(var node_i = 0, added_nodes_length = added_nodes.length; node_i < added_nodes_length ; node_i++)
                {
                    node_curr = added_nodes[node_i];
                    if(window.CPB_is_blocked_ed5g)
                    {
                        observer.disconnect();
                        return;
                    }
                    scanAndBlock( node_curr );
                    if(window.CPB_is_blocked_ed5g)
                        callOneTimeOnTitleExist(
                            function()
                            {
                                if ( isSiteAboutCookies() )
                                    unblockCookieNode();
                            }
                        );
                    // Is below necessary ??
                    // do // skip all descendants - they are scaned in scanAndBlock
                    // {
                        // node_i++;                           
                    // } while ( typeof added_nodes[node_i+1] !== 'undefined' && isDescendant(node_curr, added_nodes[node_i+1]) );                        
                }
        }
    }
    // addEventListener: IE >= 9
    // due detecting "cookie popup" is simplified, on many pages about cookies there is detected "false positive", 
    // so on these pages we are don't try block any popups
    if( !isSiteAboutCookies() )
    {
        // FF >=14 CHR >=18
        var MUTATIONOBSERVER = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var doc_observer = new MUTATIONOBSERVER(dom_listener);
        doc_observer.observe(document, {childList : true, subtree: true});
        ((typeof document.addEventListener !== 'undefined') ?document.addEventListener :document.attachEvent)(
            'readystatechange',
            function()
            {
                if(document.readyState === 'interactive')
                {
                    if( !window.CPB_is_blocked_ed5g )
                    {
                        scanAndBlock(document.body);
                        if(window.CPB_is_blocked_ed5g)
                            callOneTimeOnTitleExist(
                                function()
                                {
                                    if ( isSiteAboutCookies() )
                                        unblockCookieNode();
                                }
                            );
                    }
                }
            },
            /*useCapture = */ true
        );
    }
    else
    {
        GM__changeJsonAttr(window.location.hostname, 'info', 'PAGE_ABOUT_COKIES');
        cmd_sendLogs();
        cmd_clearLogs();
    }
    ((typeof document.addEventListener !== 'undefined') ?document.addEventListener :document.attachEvent)(
        'readystatechange',
        function()
        {
            if(document.readyState === 'complete')
            {
                if( !window.CPB_is_blocked_ed5g )
                {
                    GM__changeJsonAttr(window.location.hostname, 'cookie_found', /cookie/i.test(document.body.textContent));
                }
            }
        }
    );
    GM_registerMenuCommand("Show logs", cmd_showLogs);
    GM_registerMenuCommand("Send and clear logs", function(){cmd_sendLogs();cmd_clearLogs();});
}
