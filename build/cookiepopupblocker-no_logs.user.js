// ==UserScript==
// @name           CookiePopupBlocker
// @version        1.2
// @description    Blokuje banery z informacją o używaniu przez witrynę cookies
// @run-at         document-start
// @namespace      https://github.com/piotrex
// @include        http://*.pl*
// @include        https://*.pl*
// @grant          none
// @downloadURL    https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-no_logs.user.js
// @updateURL      https://raw.github.com/piotrex/CookiePopupBlocker/master/build/cookiepopupblocker-no_logs.user.js
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @icon           https://raw.github.com/piotrex/CookiePopupBlocker/master/icon/32x32.png
// ==/UserScript==
window.CPB_blocked_ed5gdg7f = null;
if(window.self === window.top)
{
    ////////////////////////////////////////////////////
    //  General functions
    ////////////////////////////////////////////////////
    // http://stackoverflow.com/a/5109799/1794387
    var getChildByNodeName = function (node, allowed_node_names)
    {
        var childCollection = [];
        var getChild = function (elements)
        {
            for(var k = 0 ; k < elements.length ; k++)
            {
                var childs = elements[k].childNodes;
                if (childs)
                {
                    getChild(childs);
                    for (var i = 0; i < childs.length; i++)
                        if (allowed_node_names.indexOf(childs[i].nodeName) > -1)
                            childCollection.push(childs[i]);
                }
            }
        };
        getChild([node]);
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
        if(node.nodeName.toUpperCase() === 'IFRAME')
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
        node.parentNode.removeChild(node);
        window.CPB_blocked_ed5gdg7f = true;
    }
    // runed at document.body has been loaded (root_node=document.body) or it is inserted node to doc after doc loaded
    function popupBlock(root_node)
    {
        var wanted_nodes = ["DIV","IFRAME"];
        var node_content;
        var nodes = (root_node.getElementsByTagName) ? getChildByNodeName(root_node, wanted_nodes) : [];
        if (root_node !== document.body && wanted_nodes.indexOf(root_node.nodeName) > -1)
            nodes.unshift(root_node);
        for (var node_i = 0, node_curr = nodes[node_i] ; node_i < nodes.length ; )
        {
            if( node_i < 5 || // initial filter
                nodes.length-1 - node_i < 10 ||
                root_node !== document ||
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
                        // prevent interpret and block parent of cookie node
                        var node_childs = ((typeof (node_curr.getElementsByTagName('div'))!=='undefined')?node_curr.getElementsByTagName('div'):[]);
                        for( var i = 0 ; i < node_childs.length ; i++)
                            if(isCookieLabeled_stronger(node_childs[i]))
                            {
                                if(isCookieContent(node_childs[i]))
                                    node_curr = node_childs[i];
                                break;
                            }
                        blockCookieNode(node_curr);
                        return;
                    }
                    else // hasn't cookiecontent? bypass all children 
                    {
                        do
                        {
                            node_i++;
                        } while (isDescendant(nodes[node_i+1], node_curr));
                        node_curr = nodes[node_i];
                        continue;
                    }
                }
                else
                {
                    node_i++;
                    node_curr = nodes[node_i];
                    continue;
                }
            }
        }
    }
    ////////////////////////////////////////////////////
    //  Start main script instructions
    ////////////////////////////////////////////////////
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
        for (var i = 0 ; i < mutations.length ; i++)
        {
            var added_nodes = mutations[i].addedNodes;
            if(added_nodes)
                for(var j = 0 ; j < added_nodes.length ; j++)
                {
                    if(window.CPB_blocked_ed5gdg7f)
                    {
                        observer.disconnect();
                        return;
                    }
                    popupBlock( added_nodes[j] );
                }
        }
    }
    document.addEventListener(
        'readystatechange',
        function()
        {
            if(document.readyState === 'interactive')
            {
                var observer = new MutationObserver(dom_listener);
                observer.observe(document, {childList : true, subtree: true});
                if( ! window.CPB_blocked_ed5gdg7f )
                    popupBlock(document.body);
            }
        },
        /*useCapture = */ true
    );
}
