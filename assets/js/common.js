var baseurl = document.querySelector('meta[name="baseurl"]').content;
let currentTheme = localStorage.getItem('theme');
let isDarkMode = false;

document.querySelector('html').dataset.theme = currentTheme;

document.addEventListener('DOMContentLoaded', function(){
    // Init theme

    if (currentTheme === 'dark'){
        isDarkMode = true;
        const themeIcons = document.querySelectorAll(".ico-dark, .ico-light");

        themeIcons.forEach((ico) => {
            ico.classList.add('active');
        });
    }
    else {
        isDarkMode = false;
    }

    // navigation (mobile)
    var siteNav = document.querySelector('#navigation');
    var menuButton = document.querySelector("#btn-nav");

    menuButton.addEventListener('click', function() {
        if (menuButton.classList.toggle('nav-open')) {
            siteNav.classList.add('nav-open');
        } else {
            siteNav.classList.remove('nav-open');
        }
    });

    // kept nav opened
    var firstNavs = document.querySelectorAll('#nav-first');
    var page_path = window.location.pathname.replace(/%20/g, " ");
    page_path = page_path.replace(baseurl, "");
    var page_tree = page_path.split('/');

    Array.prototype.forEach.call(firstNavs, function (nav_first) {
        if (page_tree[1] === nav_first.ariaLabel){
            nav_first.classList.add('active');

            var secondNavs = nav_first.querySelectorAll('#nav-second');

            Array.prototype.forEach.call(secondNavs, function (nav_second) {
                if (page_tree[2] === nav_second.ariaLabel){
                    nav_second.classList.toggle('active');

                    var thirdNavs = nav_second.querySelectorAll('#nav-third');

                    Array.prototype.forEach.call(thirdNavs, function (nav_third) {
                        if (page_tree[3] === nav_third.ariaLabel){
                            nav_third.classList.toggle('active');
                        }
                    });
                }
            });
        }
    });

    // navigation (toogle sub-category)
    document.addEventListener('click', function(e){
        var target = e.target;

        while (target && !(target.classList && target.classList.contains('nav-list-expander'))) {
            target = target.parentNode;
        }

        if (target) {
            e.preventDefault();
            var nav_item = target.parentNode;
            target.ariaPressed = nav_item.parentNode.classList.toggle('active');
        }
    });

    document.querySelectorAll('.nav-item').forEach((nav_item) => {
        if (nav_item.parentNode.classList.contains('active')){
            nav_item.classList.add('selected');
        }
        else {
            nav_item.classList.remove('selected');
        }
    });

    // Change Datk/Light Theme
    const themeButton = document.querySelectorAll("#btn-brightness");
    const innerContent = document.querySelector('main');

    themeButton.forEach((btn) => {
        btn.addEventListener('click', function() {
            const moonIcons = document.querySelectorAll(".ico-dark");
            const sunIcons = document.querySelectorAll(".ico-light");
            const codeblocks = innerContent != null ? innerContent.querySelectorAll('pre') : null;

            moonIcons.forEach((ico) => {
                ico.classList.toggle('active');
            });

            sunIcons.forEach((ico) => {
                ico.classList.toggle('active');
            });

            if (isDarkMode){
                localStorage.setItem('theme', 'light');
                // Disable highlighter dark color theme
                if (codeblocks) {
                    Array.from(codeblocks).forEach(function (codeblock){
                        codeblock.classList.remove('pre-dark');
                    });
                }

                changeGiscusTheme('light');
                isDarkMode = false;
            }
            else {
                localStorage.setItem('theme', 'dark');
                // Disable highlighter default color theme
                if (codeblocks) {
                    Array.from(codeblocks).forEach(function (codeblock){
                        codeblock.classList.add('pre-dark');
                    });
                }

                changeGiscusTheme('noborder_gray');
                isDarkMode = true;
            }

            document.querySelector('html').dataset.theme = localStorage.getItem('theme');
        });
    });

    function changeGiscusTheme(theme) {
        const iframe = document.querySelector('iframe.giscus-frame');
        if (!iframe) return;

        const message = {
            setConfig: {
                theme: theme
            }
        };

        iframe.contentWindow.postMessage({ giscus: message }, 'https://giscus.app');
    }

    // search box
    const searchButton = document.querySelectorAll("#btn-search");
    const cancelButton = document.querySelector('#btn-clear');
    const searchPage = document.querySelector("#search");

    if (searchButton) {
        searchButton.forEach((btn) => {
            btn.addEventListener('click', function() {
                searchPage.classList.add('active');
                document.getElementById("search-input").focus();
            });
        });
    }

    if (searchPage) {
        searchPage.addEventListener('click', function(event) {
            const searchBar = document.querySelector(".search-box");
            var target = event.target;

            if (searchBar.contains(target))
                return;

            searchPage.classList.remove('active');
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            document.getElementById('btn-clear').style.display = 'none';
            document.getElementById('search-input').value = "";

            Array.from(document.querySelectorAll('.result-item')).forEach(function (item) {
                item.remove();
            });
        });
    }
});

function searchPost(pages){
    document.getElementById('search-input').addEventListener('keyup', function() {
        var keyword = this.value.toLowerCase();
        var matchedPosts = [];
        const searchResults = document.getElementById('search-result');
        const prevResults = document.querySelector(".result-item");
    
        if (keyword.length > 0) {
            searchResults.style.display = 'block';
            document.getElementById('btn-clear').style.display = 'block';
        } else {
            searchResults.style.display = 'none';
            document.getElementById('btn-clear').style.display = 'none';
        }
        
        Array.from(document.querySelectorAll('.result-item')).forEach(function (item) {
            item.remove();
        });
    
        for (var i = 0; i < pages.length; i++) {
            var post = pages[i];
    
            if (post.title === 'Home' && post.type == 'category') continue;
    
            if (post.title.toLowerCase().indexOf(keyword) >= 0
            || post.path.toLowerCase().indexOf(keyword) >= 0
            || post.tags.toLowerCase().indexOf(keyword) >= 0){
                matchedPosts.push(post);
            }
        }
    
        if (matchedPosts.length === 0) {
            insertItem('<span class="description">There is no search result.</span>');

            return;
        } 
    
        matchedPosts.sort(function (a, b) {
            if (a.type == 'category') return 1;
    
            return -1;
        });
    
        for (var i = 0; i < matchedPosts.length; i++) {
            var highlighted_path = highlightKeyword(matchedPosts[i].path, keyword);
    
            if (highlighted_path === '')
                highlighted_path = "Home";
    
            if (matchedPosts[i].type === 'post'){
                var highlighted_title = highlightKeyword(matchedPosts[i].title, keyword);
                var highlighted_tags = highlightKeyword(matchedPosts[i].tags, keyword);
    
                if (highlighted_tags === '')
                    highlighted_tags = "none";

                insertItem('<a href="' +
                    matchedPosts[i].url +
                    '"><table><thead><tr><th><svg class="ico-book"></svg></th><th>' + highlighted_title +  
                    '</th></tr></thead><tbody><tr><td><svg class="ico-folder"></svg></td><td>' + highlighted_path +
                    '</td></tr><tr><td><svg class="ico-tags"></svg></td><td>' + highlighted_tags +
                    '</td></tr><tr><td><svg class="ico-calendar"></svg></td><td>' + matchedPosts[i].date +
                    '</td></tr></tbody></table></a>'
                );
            }
            else {
                insertItem('<a href="' +
                    matchedPosts[i].url +
                    '"><table><thead><tr><th><svg class="ico-folder"></svg></th><th>' + highlighted_path + 
                    '</th></tr></thead></table></a>'
                );
            }
        }

        function insertItem(inner_html){
            let contents = document.createElement("li");
            contents.classList.add("result-item");
            contents.innerHTML = inner_html;
            searchResults.append(contents);
        }
    });

    function highlightKeyword(txt, keyword) {
        var index = txt.toLowerCase().lastIndexOf(keyword);
    
        if (index >= 0) { 
            out = txt.substring(0, index) + 
                "<span class='highlight'>" + 
                txt.substring(index, index+keyword.length) + 
                "</span>" + 
                txt.substring(index + keyword.length);
            return out;
        }
    
        return txt;
    }
}