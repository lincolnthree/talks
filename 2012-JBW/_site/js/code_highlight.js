/*

 show_lines and hide_lines assumes a element that has data-prettify='code-element-id' and data-prettify_lines="from:to"

 */

var CodeHighlight = (function ($) {

    function initialize(options) {
        var settings = $.extend({
            'reveal':Reveal
        }, options);

        var Reveal = settings.reveal;
        Reveal.addEventListener('slidechanged', showLines);
        Reveal.addEventListener('fragmentshown', showLines);
        Reveal.addEventListener('fragmenthidden', hide_lines);
    }

    function showLines(event) {
        $(event.fragment).each(function (count, elem) {
            var code = $(this);
            highlight_fragment(code);
        })
    }

    function hide_lines(event) {
        $(event.fragment).each(function (i, elem) {
            var fragment = $(this);
            var coords = get_coords(fragment);
            var code = get_code(coords);
            if (typeof code !== 'undefined') {
                code.block.html(code.orig.code.html());
                prettyPrint();

                var previous_fragment = $(".present .fragment.visible").last();
                highlight_fragment(previous_fragment);
            }
        })
    }

    function highlight_fragment(fragment) {
        var coords = get_coords(fragment);
        if (typeof coords !== 'undefined') {
            highlight_code(coords);
        }
    }

    /**
     * Highlights the code specified by the coords object
     * @param coords
     */
    function highlight_code(coords) {
        var code = get_code(coords);
        var new_html = "";

        var text_lines = code.orig.code.html().split('\n');
        var between = false;
        var padding = 0;
        for (var i = 0; i < text_lines.length; i++) {
            var line = text_lines[i]
            if (i == coords.from) {
                between = true;
                padding = determine_left_padding(line);

                var new_line = line.substring(padding);
                new_html += '<' + 'pre' + ' class="prettyprint highlight">\n'
                new_html += ('<' + 'code' + ' class="prettyprint">' + new_line + '\n')
            }
            else {
                new_html += (between ? line.substring(padding) : line) + '\n'
            }
            if (i == coords.to) {
                between = false;
                new_html += '</code></pre>'
            }
        }

        code.block.html(new_html);
        prettyPrint();
        $('.present .highlight').trigger('lineshighlighted');
    }

    /**
     * Creates a coords object from the data-* attributes of the given fragment parameter.
     *
     * fragment refers to a DOM object that must have 2 data attributes defined:
     *  -       data-prettify: the id of the <code> element to be highlighted
     *  - data-prettify_lines: the lines to highlight in "to:from" string syntax
     *
     * coords is an object with three properties:
     *  -   id: the id of the <code> element to be highlighted
     *  - from: the first line to highlight
     *  -   to: the last line to highlight
     *
     * @param fragment
     * @return coords
     */
    function get_coords(fragment) {
        if (typeof fragment.attr('data-prettify') === 'undefined') {
            return undefined;
        }
        var coords = {};
        coords.id = fragment.attr('data-prettify');
        var lines = fragment.attr('data-prettify_lines').split(':');
        coords.from = lines[0];
        coords.to = lines[1];
        return coords;
    }

    /**
     * Create a code object from the given coords parameter.
     *
     * The code object has the following properties:
     * -             id: the id of the <code> element to be highlighted
     * -     code.block: the jQuery object of the <code> element to be highlighted
     * -   code.orig.id: the id of the un-displayed element that contains the original markup of the <code> element
     * - code.orig.code: the original markup of the <code> element
     * @param coords
     * @return code
     */
    function get_code(coords) {
        if (typeof coords === 'undefined') {
            return undefined;
        }
        var code = {};
        code.id = coords.id;
        code.block = $('#' + coords.id);
        code.orig = {};
        code.orig.id = 'code_' + coords.id;
        code.orig.code = $('#' + code.orig.id);
        if (code.orig.code.length == 0) {
            $('<code />', {
                id: code.orig.id,
                style: "display:none",
                html: code.block.html()
            }).appendTo('body');
            code.orig.code = $('#' + code.orig.id);
        }
        return code;
    }

    function determine_left_padding(line) {
        for (i = 0; i < line.length; i++) {
            if (line.charAt(i) != ' ') {
                return i
            }
        }
        return 0
    }

    return {
        initialize: initialize
    }

})(jQuery);