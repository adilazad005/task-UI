$(document).ready(function(){
    
    var widget_id;




    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////// Sidebar Settings //////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // hide sidebar
    $('#hide-sidebar').click(function(){    
        $('#sidebar').addClass('hide-sidebar'); 
        $('.frame').addClass('frame-no-sidebar');  
        $('#show-sidebar').removeClass('show-sidebar-hidden');
        $('.page-content').removeClass('sidebar-on'); 
    })
    // show sidebar
    $('#show-sidebar').click(function(){        
        $('#sidebar').removeClass('hide-sidebar');
        $('.frame').removeClass('frame-no-sidebar');  
        $('#show-sidebar').addClass('show-sidebar-hidden');
        $('.page-content').addClass('sidebar-on');
    })

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////// Mobile Preview ///////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // preview mobile view
    $(".fa.fa-mobile-alt").parent().click(function(){
    
        if($(".main").hasClass('mobile')){
            $(".main").removeClass('mobile');
            $(".main").unwrap();
            $(".frame").remove();
        } else {
            $(".main").addClass('mobile');
            $(".main").wrapAll('<iframe id="mobile-view" frameborder="0"></iframe>');
            $( '<img src="../img/mobile-frame.png" class="frame">' ).insertBefore( "#mobile-view" );

            const iframe = document.getElementById("mobile-view"); 
            let css = $("head").html();
            let mobile_head = $("#mobile-view").contents().find("head");
            let mobile_body = $("#mobile-view").contents().find("body");
            $(mobile_head).append(css);
            $(mobile_body).append(iframe.innerHTML);
        }
        // alert('Mobile Preview Disabled');
        
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////// Drag and Drop widgets ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // make widgets dragable
    $(".widget").draggable({
        opacity: 0.7,
        helper: "clone",
    });

    // Define dropable area for sections only
    $('.droppable').droppable({
        accept: ".widget#section",
        drop: function (event, ui) {
            if(widget_id){
                $('#'+widget_id).parent().removeClass('widget-frame');
            }
            //generate unique id for section with prefix 'es'
            widget_id = 'es'+ Math.floor(10000 + Math.random() * 90000);
            //generate unique id for column with prefix 'ec'
            column_id = 'ec'+ Math.floor(10000 + Math.random() * 90000);
            //create section from section template
            $(this).before([{vartag: 'div', varclass: 'lp-section lp-section-widget lp-section-fullwidth', varid: widget_id, colid: column_id}].map(section).join(''))
            
            //show propertybar with currently added section id
            showProperties(widget_id);
            PropertyBarAutoValue(widget_id);
            PropertyBarSectionValue(widget_id);
            columnDroppable();

        }
    })

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////// Default Widgets //////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const section = ({ vartag, varclass, varid, colid }) => `
    <div class="lp-section-wrap ">
        <${vartag} class="show-icons ${varclass}" id="${varid}">
            <div class="lp-widget-overlay" data-id="${varid}"></div>
            <div class="lp-section-inner row">
                <div class="col-sm-12 lp-section-column show-icons ui-droppable" id="${colid}">
                    <div class="lp-widget-overlay"></div>

                </div>
            </div>
        </${vartag}>
    </div>
    `;
    const column = ({ varclass, varid }) => `
        <div class="${varclass}" id="${varid}">
            <div class="lp-widget-overlay" data-id="${varid}"></div>
        </div>
    `;
    const heading = ({ vartag, varclass, varid, varcontent }) => `
        <div class="lp-widget-wrap ">
            <${vartag} class="show-icons ${varclass}" id="${varid}">
            <div class="lp-widget-overlay" data-id="${varid}" contenteditable="false"></div>
                ${varcontent}
            </${vartag}>
        </div>
    `;


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////// Propertybar Settings ///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Make property Bar draggable
    $('#property-bar').draggable();
    // hide propertybar by default
    $('#property-bar').addClass('hide'); 
    // Close Propertybar
    $('#close-propertybar').click(function(){    
        $('#property-bar').addClass('hide'); 
        $('#'+widget_id).parent().removeClass('widget-frame');
    })
    // propertybar menu accordion
    $("#accordion").on("hide.bs.collapse show.bs.collapse", e => {
        $(e.target)
            .prev()
            .find("i:last-child")
            .toggleClass("fa-minus fa-plus");
    });




    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////// Widget Editor Icons ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Widget editor buttons show on mouse hover
    $('.main').on('mouseenter','.show-icons', function() {
        $(this).find('.editor-container').remove();
        // $(".lp-widget-overlay").hide();
        $(this).find('.lp-widget-overlay').first().append($('#editor-container').html());
        // $(this).find('.lp-widget-overlay').show();
    });
    // Widget editor buttons hide on mouse leave    
    $('.main').on('mouseleave','.show-icons', function() {
        $(this).find('.editor-container').remove();
        // $(".lp-widget-overlay").hide();
        $(this).parents('.show-icons').first().find('.lp-widget-overlay').first().append($('#editor-container').html());
        // $(this).parents('.show-icons').find('.lp-widget-overlay').show();
    });

    // Widget editor button delete
    $('.main').on('click','.fa.fa-trash',function() {
        c = confirm("Sure you want to delete this?");
        if (c == true) {
            wid = $(this).closest(".lp-widget-overlay").parent().attr('id');
            if(getWidget(wid) == 'column'){
                let ColNo = $(this).closest('.lp-section-inner').children().length;
                if(ColNo == 1){
                    alert("One column must remain in section")
                } else {
                    $(this).closest('.lp-section-inner').find('.lp-section-column').removeClass('col-sm-'+12/ColNo).addClass('col-sm-'+12/(ColNo-1));
                    $(this).closest(".lp-widget-overlay").parent().remove();
                }
             } else {
                $(this).closest(".lp-widget-overlay").parent().parent().remove();
            }

            pbid = $('#property-bar').data('id');
            console.log(wid);
            console.log(pbid);
            if( wid == pbid ){
                $('#property-bar').addClass('hide').attr('data-id', '');
            }
        }
    });
    // Widget editor button copy
    $('.main').on('click','.fa.fa-copy',function() {
        // get closest overlay
        let target = $(this).closest(".lp-widget-overlay");
        let wid = target.parent().attr('id');
        // empty contents that appended editor due to hover 
        target.empty();
        // generate new id for the clone
        new_id = wid.substr(0,2)+ Math.floor(10000 + Math.random() * 90000);
        // find the wrapper
        if(getWidget(wid) == 'column'){
            wrap = target.parent();
            
         } else {
            wrap = target.parent().parent();
        }         
        // remove frame from the wrapper
        wrap.removeClass('widget-frame');
        // $('#'+widget_id).parent().removeClass('widget-frame');
        // create a copy from the wrapper
        new_html = wrap.clone().addClass('widget-frame');
         // set the new id to the widget inside wrapper       
        if(getWidget(wid) == 'column'){
            new_html.attr('id', new_id);
            
         } else {
            new_html.children().attr('id', new_id);
        }

        // change the data-id inside overlay - it has no use till now.
        new_html.find(".lp-widget-overlay").attr('data-id', new_id);

        // change all contents ids as well
        new_html.find('.show-icons').each(function() {
            console.log($(this).prop('id')+' - '+$(this).prop('id').substr(0,2)+ Math.floor(10000 + Math.random() * 90000));
            replacement_id = $(this).prop('id').substr(0,2)+ Math.floor(10000 + Math.random() * 90000);
            $(this).prop('id', replacement_id);
        })

        // populate the html just after current wrapper
        wrap.after(new_html);

        widget_id = new_id;
        showProperties(widget_id);
        columnDroppable();
    });
    // Widget editor button show propertybar - should show with id
    // $('.main').on('click','.editor-icon.edt',function() {
        
    //     let target = $(this).closest(".lp-widget-overlay");
    //     let wrap = target.parent().parent();
    //     $('#'+widget_id).parent().removeClass('widget-frame');
    //     wrap.addClass('widget-frame');
    //     widget_id = target.parent().attr('id');

            
    //     showProperties(widget_id);
    //     PropertyBarAutoValue(widget_id);
    //     PropertyBarSectionValue(widget_id);
    //     PropertyBarHeadingValue(widget_id)
    // });
    $('.main').on('click','.editor-icon.edt',function() {  
        let target = $(this).closest(".lp-widget-overlay");
        $('#'+widget_id).removeClass('widget-frame');
        $('#'+widget_id).parent().removeClass('widget-frame');
        $('#'+widget_id).parent().parent().removeClass('widget-frame');
        widget_id = target.parent().attr('id');
        let wrap = '';
        curWidget = getWidget(widget_id);

        if(curWidget == 'column'){
            wrap = target.parent();
        } else { 
            wrap = target.parent().parent();
        }
            wrap.addClass('widget-frame');

        showProperties(widget_id);
        PropertyBarAutoValue(widget_id);
        PropertyBarSectionValue(widget_id);
        PropertyBarHeadingValue(widget_id)
    });















//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////// Widget Properties ////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Section Properties 


// Range slider for container width
$('.range-block').hide();
$('#content-width').on('change', function () {
    if ($('#content-width').val() == 'container') {
        $('.range-block#section-width-range').show();
        $('#'+widget_id).removeClass('lp-section-fullwidth');
        let con_wd = $('#container-width-r').val();
        $('#container-width').val(con_wd);
        $('#'+widget_id).css('width', con_wd+'px');
    } else {
        $('.range-block#section-width-range').hide();
        $('#'+widget_id).addClass('lp-section-fullwidth');
        $('#'+widget_id).css('width', '');
    } 
})

// set width of container with range
$('#container-width-r').on('input', function () {
    $('#container-width').val(this.value);
    $('#'+widget_id).css('width', this.value+'px');
})
// set width of container with input
$('#container-width').on('input', function () {
    $('#'+widget_id).css('width', this.value+'px');
})

// Set alignment of container
$('#section-h-align').on('change', function () {
    if ($('#section-h-align').val() == 'middle') {
        // $('#'+widget_id).css('justify-content', 'center');
        $('#'+widget_id).removeClass('ml-auto');
        $('#'+widget_id).addClass('mx-auto');
    } else if ($('#section-h-align').val() == 'end') {
        // $('#'+widget_id).css('justify-content', 'flex-end');
        $('#'+widget_id).removeClass('mx-auto');
        $('#'+widget_id).addClass('ml-auto');
    } else {
        // $('#'+widget_id).css('justify-content', 'flex-start');
        $('#'+widget_id).removeClass('ml-auto');            
        $('#'+widget_id).removeClass('mx-auto');
    }
})

// Range slider for container height
$('#section-height-select').on('change', function () {
    if ($('#section-height-select').val() == 'fit-to-screen') {
        $('.range-block#section-height-range').hide();
        $('#'+widget_id).removeClass('lp-section-minheight');
        $('#'+widget_id).addClass('lp-section-fullheight');
        $('#'+widget_id).css('height', '100vh');
    } else if ($('#section-height-select').val() == 'min-height') {
        $('.range-block#section-height-range').show();
        $('#'+widget_id).removeClass('lp-section-fullheight');
        $('#'+widget_id).addClass('lp-section-minheight');
        var con_ht = $('#min-height-r').val();
        $('#min-height').val(con_ht);
        $('#'+widget_id).css('height', con_ht+'px');
    } else {
        $('#'+widget_id).removeClass('lp-section-fullheight');
        $('#'+widget_id).removeClass('lp-section-minheight');
        $('.range-block#section-height-range').hide();
        $('#'+widget_id).css('height', '');
    } 
})

// set height of container with range
$('#min-height-r').on('input', function () {
    $('#min-height').val(this.value);
    $('#'+widget_id).css('height', this.value+'px');
})
// set height of container with input
$('#min-height').on('input', function () {
    $('#min-height-r').val(this.value);
    $('#'+widget_id).css('height', this.value+'px');
})

// Section overflow
$('#section-overflow').on('change', function () {
    if ($('#section-overflow').val() == 'hidden') {
        $('#'+widget_id).css('overflow', 'hidden');
    } else {
        $('#'+widget_id).css('overflow', 'auto');
    }
})

// Section HTML
$('#section-html').on('change', function () {
        let v = $('#section-html').val();
        let widget = $('#'+widget_id);
        let classes = widget.attr("class");
        let style = widget.attr("style");
        let content = widget.html();
        widget.replaceWith( "<"+v+" class='"+classes+"' style='" +style+ "' id='"+widget_id+"'>"+ content +"</"+v+">" );
})

// Section column number
$('#col-no').on('change', function () {
        let columnNo = $('#col-no').val();
        let innerSection = $('#'+widget_id).find('.lp-section-inner');
        let prevColNo = innerSection.children().length;
        if(prevColNo > columnNo){
            alert("Please delete columns manually");
            $('#col-no').val(prevColNo);
        }else{
            innerSection.find('.lp-section-column').removeClass('col-sm-'+12/prevColNo).addClass('col-sm-'+12/columnNo);
            toAdd = columnNo - prevColNo;
            for(i = 0; i<toAdd; i++){
                //generate unique id for section with prefix 'ec'
                column_id = 'ec'+ Math.floor(10000 + Math.random() * 90000);
                //create column from section template
                innerSection.append([{varclass: 'col-sm-'+12/columnNo+' lp-section-column show-icons ui-droppable', varid: column_id}].map(column).join(''));
            }
        }
    columnDroppable();
});


// Heading Properties 

// Text input by contenteditable
// $('#content-text-input').on('focus', function () {
//     $('#content-text-input').val($("#"+widget_id).text().replace(/(?:\r\n|\r|\n)/g, '').replace(/\s+/g," "));
// })
// $('.main').on('focus', '[contenteditable]', function() {
//     widget_id = $(this).attr('id');
//     showProperties(widget_id);
//     PropertyBarHeadingValue(widget_id);
//     PropertyBarAutoValue(widget_id);
// })

// Text input area
$('#content-text-input').on('input', function () {
    let text = $('#content-text-input').val();
    $("#"+widget_id).text(text);
    $("#"+widget_id).prepend('<div class="lp-widget-overlay" data-id="'+widget_id+'"></div>')
})

// Text input HTML
$('#heading-html').on('change', function () {
    let v = $('#heading-html').val();
    // let widget = $('#' + widget_id + '.lp-widget-wrap');
    let classes = $("#"+widget_id).attr("class");
    let style = $("#"+widget_id).attr("style");
    let content = $("#"+widget_id).text();
    $("#"+widget_id).replaceWith("<" + v + " class='" + classes + "' style='" +style+ "' id='"+widget_id+"'><div class='lp-widget-overlay' data-id='"+widget_id+"'></div>" + content + "</" + v + ">");
    GetHeadingTypography(widget_id);
})

// Heading alignment
$('#heading-alignment').on('change', function () {
    let v = $('#heading-alignment').val();
    $("#"+widget_id).css('text-align', v);
})

// Font selection with FontSelect
$('#content-font-input').fontselect({
    systemFonts: false,
    placeholderSearch: 'Type to search...',
    lookahead: 4
 })
 .on('change', function() {
    $("#"+widget_id).css('font-family', $(this).val().replace(/\+/g,' '));
 });
//  font size
$('#content-font-size').on('input', function () {
    let v = $('#content-font-size').val();
    $("#"+widget_id).css('font-size', v+'px');
})
//  font line height
$('#content-font-lineheight').on('input', function () {
    let v = $('#content-font-lineheight').val();
    $("#"+widget_id).css('line-height', v+'px');
})
//  font letter spacing
$('#content-font-letterspacing').on('input', function () {
    let v = $('#content-font-letterspacing').val();
    $("#"+widget_id).css('letter-spacing', v+'px');
})
//  font weight
$('#content-font-weight').on('change', function () {
    let v = $('#content-font-weight').val();
    $("#"+widget_id).css('font-weight', v);
})
//  font decoration
$('#content-font-decoration').on('change', function () {
    let v = $('#content-font-decoration').val();
    $("#"+widget_id).css('text-decoration', v);
})
//  font transform
$('#content-font-transform').on('change', function () {
    let v = $('#content-font-transform').val();
    $("#"+widget_id).css('text-transform', v);
})
//  font style
$('#content-font-style').on('change', function () {
    let v = $('#content-font-style').val();
    $("#"+widget_id).css('font-style', v);
})
// Common Properties


// change widget color
$('#widgetcolor').on('input', function () {
    let widgetcolor = $('#widgetcolor').val();
    $("#"+widget_id).css('color', widgetcolor);
})
// change bgcolor
$('#bgcolor').on('input', function () {
    let bgcolor = $('#bgcolor').val();
    $("#"+widget_id).css('background-color', bgcolor);
})

//Section Margin top
$('#margin-top').on('input', function () {
    unit = 'px';
    let marginTop = $('#margin-top').val();
    $('#'+widget_id).css('margin-top', marginTop+unit);
})
//Section Margin right
$('#margin-right').on('input', function () {
    unit = 'px';
    let marginRight = $('#margin-right').val();
    $('#'+widget_id).css('margin-right', marginRight+unit);
})
//Section Margin bottom
$('#margin-bottom').on('input', function () {
    unit = 'px';
    let marginBottom = $('#margin-bottom').val();
    $('#'+widget_id).css('margin-bottom', marginBottom+unit);
})
//Section Margin left
$('#margin-left').on('input', function () {
    unit = 'px';
    let marginLeft = $('#margin-left').val();
    $('#'+widget_id).css('margin-left', marginLeft+unit);
})

//Section padding top
$('#padding-top').on('input', function () {
    unit = 'px';
    let paddingTop = $('#padding-top').val();
    $("#"+widget_id).css('padding-top', paddingTop+unit);
})
//Section padding right
$('#padding-right').on('input', function () {
    unit = 'px';
    let paddingRight = $('#padding-right').val();
    $("#"+widget_id).css('padding-right', paddingRight+unit);
})
//Section padding bottom
$('#padding-bottom').on('input', function () {
    unit = 'px';
    let paddingBottom = $('#padding-bottom').val();
    $("#"+widget_id).css('padding-bottom', paddingBottom+unit);
})
//Section padding left
$('#padding-left').on('input', function () {
    unit = 'px';
    let paddingLeft = $('#padding-left').val();
    $("#"+widget_id).css('padding-left', paddingLeft+unit);
})

//Position
$('#position_property').on('input', function () {
    let position = $('#position_property').val();
    $('#'+widget_id).css('position', position);
})
//Z Index
$('#z-index').on('input', function () {
    let zindex = $('#z-index').val();
    $('#'+widget_id).css('z-index', zindex);
})

// Shadow Properties hide input by default
$("#shadow_property").hide();
var xAxis = 10;
var yAxis = 10;
var blur = 10;
var spread = 10;
var shadowColor = '#cdcdcd';
var shadowOpacity = 'ff';
var inset = '';
// Shadow style on change
$('#inset-outset').on('change', function () {
    var shadow = $('#inset-outset').val();
        // if shadow is not none; show all shadow properties input
    if( shadow =='outset' ){
        inset = '';
        $("#shadow_property").show();         
        $("#"+widget_id).css('box-shadow', xAxis+'px '+yAxis+'px '+blur+'px '+spread+'px '+shadowColor+shadowOpacity+' '+inset);
    } else if( shadow =='inset' ){
        inset = 'inset';
        $("#shadow_property").show();   
        $("#"+widget_id).css('box-shadow', xAxis+'px '+yAxis+'px '+blur+'px '+spread+'px '+shadowColor+shadowOpacity+' '+inset);     
    } else if( shadow =='none' ){
        $("#shadow_property").hide();   
        $("#"+widget_id).css('box-shadow', '');     
    }
})
// Change xAxis value
$('#shadow-x').on('input', function () {
    xAxis = $('#shadow-x').val();
    $("#"+widget_id).css('box-shadow', xAxis+'px '+yAxis+'px '+blur+'px '+spread+'px '+shadowColor+shadowOpacity+' '+inset);
})
// Change yAxis value
$('#shadow-y').on('input', function () {
    yAxis = $('#shadow-y').val();
    $("#" + widget_id).css('box-shadow', xAxis + 'px ' + yAxis + 'px ' + blur + 'px ' + spread + 'px ' + shadowColor + shadowOpacity + ' ' + inset);
})
// Change blur value
$('#shadow-blur').on('input', function () {
    blur = $('#shadow-blur').val();
    $("#" + widget_id).css('box-shadow', xAxis + 'px ' + yAxis + 'px ' + blur + 'px ' + spread + 'px ' + shadowColor + shadowOpacity + ' ' + inset);
})
// Change spread value
$('#shadow-spread').on('input', function () {
    spread = $('#shadow-spread').val();
    $("#" + widget_id).css('box-shadow', xAxis + 'px ' + yAxis + 'px ' + blur + 'px ' + spread + 'px ' + shadowColor + shadowOpacity + ' ' + inset);
})
// Change shadow color
$('#shadowcolor').on('input', function () {
    shadowColor = $('#shadowcolor').val();
    $("#" + widget_id).css('box-shadow', xAxis + 'px ' + yAxis + 'px ' + blur + 'px ' + spread + 'px ' + shadowColor + shadowOpacity + ' ' + inset);
})
// Change shadow opacity
$('#shadow_opacity').on('input', function () {
    shadowOpacity = Math.round(Math.min(Math.max(this.value/100 || 1, 0), 1) * 255).toString(16);
    $('#shadow_opacity_value').html(this.value);
    $("#" + widget_id).css('box-shadow', xAxis + 'px ' + yAxis + 'px ' + blur + 'px ' + spread + 'px ' + shadowColor + shadowOpacity + ' ' + inset);
})

// Border Properties hide input by default
$("#border-width").hide();
$("#border-radius").hide();
$("#border-color").hide();

var borderstyle, bordercolor = '';
// Border style on change
$('#border-style').on('change', function () {
    borderstyle = $('#border-style').val();
    $("#"+widget_id).css('border-style', borderstyle);
    // if border is not none; show all border properties input
    if( borderstyle !='none' ){
        $("#border-width").show();
        $("#border-radius").show();
        $("#border-color").show();
    } else { // if choose none again, hide inputs
        $("#border-width").hide();
        $("#border-radius").hide();
        $("#border-color").hide();            
    }
})
// Change border color
$('#bordercolor').on('input', function () {
    bordercolor = $('#bordercolor').val();
    $("#"+widget_id).css('border-color', bordercolor);
})
//Section border top
$('#border-top').on('input', function () {
    unit = 'px';
    let borderTop = $('#border-top').val();
    $("#"+widget_id).css('border-top', borderTop+unit+' '+borderstyle+' '+bordercolor);
    // $("#"+widget_id).css('border-top', borderTop+unit);
})
//Section border right
$('#border-right').on('input', function () {
    unit = 'px';
    let borderRight = $('#border-right').val();
    $("#"+widget_id).css('border-right', borderRight+unit+' '+borderstyle+' '+bordercolor);
})
//Section border bottom
$('#border-bottom').on('input', function () {
    unit = 'px';
    let borderBottom = $('#border-bottom').val();
    $("#"+widget_id).css('border-bottom', borderBottom+unit+' '+borderstyle+' '+bordercolor);
})
//Section border left
$('#border-left').on('input', function () {
    unit = 'px';
    let borderLeft = $('#border-left').val();
    $("#"+widget_id).css('border-left', borderLeft+unit+' '+borderstyle+' '+bordercolor);
})

var bradiusTop, bradiusRight, bradiusBottom, bradiusLeft = 0;
//Section border radius top
$('#bradius-top').on('input', function () {
    unit = 'px';
    bradiusTop = $('#bradius-top').val()+unit;
    $("#"+widget_id).css("borderTopLeftRadius", bradiusTop);
    // $("#"+widget_id).css('border-radius', bradiusTop+' '+bradiusRight+' '+bradiusBottom+' '+bradiusLeft);
})
//Section border radius right
$('#bradius-right').on('input', function () {
    unit = 'px';
    bradiusRight = $('#bradius-right').val()+unit;
    $("#"+widget_id).css("borderTopRightRadius", bradiusRight);
    // $("#"+widget_id).css('border-radius', bradiusTop+' '+bradiusRight+' '+bradiusBottom+' '+bradiusLeft);
})
//Section border radius bottom
$('#bradius-bottom').on('input', function () {
    unit = 'px';
    bradiusBottom = $('#bradius-bottom').val()+unit;
    $("#"+widget_id).css("borderBottomRightRadius", bradiusBottom);
    // $("#"+widget_id).css('border-radius', bradiusTop+' '+bradiusRight+' '+bradiusBottom+' '+bradiusLeft);
})
//Section border radius left
$('#bradius-left').on('input', function () {
    unit = 'px';
    bradiusLeft = $('#bradius-left').val()+unit;
    $("#"+widget_id).css("borderBottomLeftRadius", bradiusLeft);
    // $("#"+widget_id).css('border-radius', bradiusTop+' '+bradiusRight+' '+bradiusBottom+' '+bradiusLeft);
})
























    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////  Useful Functions  /////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function getWidget(widget_id){
        switch (widget_id.substr(0,2)) {
            case 'es':
              widget = "section";
              break;
            case 'ec':
              widget = "column";
              break;
            case 'eh':
              widget = "heading";
              break;
            case 'ei':
              widget = "image";
              break;
          }
          return widget;
    }

function PropertyBarAutoValue(widget_id) {
    $('#bgcolor').val(rgb2hex($("#"+widget_id).css("background-color")));
    $('#widgetcolor').val(rgb2hex($("#"+widget_id).css("color")));
    // margin values
    $('#margin-left').val(parseInt($("#"+widget_id).css("marginLeft"),10));
    $('#margin-top').val(parseInt($("#"+widget_id).css("marginTop"),10));
    $('#margin-right').val(parseInt($("#"+widget_id).css("marginRight"),10));
    $('#margin-bottom').val(parseInt($("#"+widget_id).css("marginBottom"),10));
    // padding values
    $('#padding-left').val(parseInt($("#"+widget_id).css("paddingLeft"),10));
    $('#padding-top').val(parseInt($("#"+widget_id).css("paddingTop"),10));
    $('#padding-right').val(parseInt($("#"+widget_id).css("paddingRight"),10));
    $('#padding-bottom').val(parseInt($("#"+widget_id).css("paddingBottom"),10));
    // position and z index
    $('#position_property').val($("#"+widget_id).css("position"));
    $('#z-index').val($("#"+widget_id).css("z-index"));
    // shadow properties
    let boxShadow = $("#"+widget_id).css("box-shadow").split(' ');//.match(/(-?\d+px)|(rgb\(.+\))/g);
     if(boxShadow != 'none'){
        $("#shadow_property").show();  
        if(boxShadow[0].substr(0,4) == "rgba"){
            if (boxShadow.length == 9){
                $('#inset-outset').val('inset');
                inset = 'inset';
                let shadowColor = rgb2hex(boxShadow[0]+boxShadow[1]+boxShadow[2]+')');
                let opacity = parseInt(boxShadow[3],10);
                // alert(opacity);
                $('#shadow-x').val(parseInt(boxShadow[4],10));
                $('#shadow-y').val(parseInt(boxShadow[5],10));
                $('#shadow-blur').val(parseInt(boxShadow[6],10));
                $('#shadow-spread').val(parseInt(boxShadow[7],10));
                $('#shadowcolor').val(shadowColor);
                $('#shadow_opacity').val(opacity*100);
                $('#shadow_opacity_value').html(opacity*100);
            } else {
                $('#inset-outset').val('outset');
                inset = '';
                let shadowColor = rgb2hex(boxShadow[0]+boxShadow[1]+boxShadow[2]+')');
                let opacity = parseFloat(boxShadow[3],10);
                // alert(opacity);
                $('#shadow-x').val(parseInt(boxShadow[4],10));
                $('#shadow-y').val(parseInt(boxShadow[5],10));
                $('#shadow-blur').val(parseInt(boxShadow[6],10));
                $('#shadow-spread').val(parseInt(boxShadow[7],10));
                $('#shadowcolor').val(shadowColor);
                $('#shadow_opacity').val(opacity*100);
                $('#shadow_opacity_value').html(opacity*100);
            }
        } else {
            if (boxShadow.length == 8){
                $('#inset-outset').val('inset');
                inset = 'inset';
                let shadowColor = rgb2hex(boxShadow[0]+boxShadow[1]+boxShadow[2]);
                $('#shadow-x').val(parseInt(boxShadow[3],10));
                $('#shadow-y').val(parseInt(boxShadow[4],10));
                $('#shadow-blur').val(parseInt(boxShadow[5],10));
                $('#shadow-spread').val(parseInt(boxShadow[6],10));
                $('#shadowcolor').val(shadowColor);
                $('#shadow_opacity').val(100);
                $('#shadow_opacity_value').html(100);
            } else {
                $('#inset-outset').val('outset');
                inset = '';
                let shadowColor = rgb2hex(boxShadow[0]+boxShadow[1]+boxShadow[2]);
                $('#shadow-x').val(parseInt(boxShadow[3],10));
                $('#shadow-y').val(parseInt(boxShadow[4],10));
                $('#shadow-blur').val(parseInt(boxShadow[5],10));
                $('#shadow-spread').val(parseInt(boxShadow[6],10));
                $('#shadowcolor').val(shadowColor);
                $('#shadow_opacity').val(100);
                $('#shadow_opacity_value').html(100);
            }
        }
            
    } else {
        $('#inset-outset').val('none');
        $("#shadow_property").hide();  
    }


    let borderLeft = $("#"+widget_id).css("borderLeft").split(' ');
    let borderTop = $("#"+widget_id).css("borderTop").split(' ');
    let borderRight = $("#"+widget_id).css("borderRight").split(' ');
    let borderBottom = $("#"+widget_id).css("borderBottom").split(' ');
    if(borderTop[1] != 'none'){
        $("#border-width").show();
        $("#border-radius").show();
        $("#border-color").show(); 
        $('#border-style').val(borderTop[1]);
        $('#bordercolor').val(rgb2hex(borderTop[2]+borderTop[3]+borderTop[4]));
        $('#border-top').val(parseInt(borderTop[0],10));
        $('#border-right').val(parseInt(borderRight[0],10));
        $('#border-bottom').val(parseInt(borderBottom[0],10));
        $('#border-left').val(parseInt(borderLeft[0],10));
    } else {
        $('#border-style').val(borderTop[1]);
        $("#border-width").hide();
        $("#border-radius").hide();
        $("#border-color").hide();  
    }

    $('#bradius-top').val(parseInt($("#"+widget_id).css("borderTopLeftRadius"),10))
    $('#bradius-right').val(parseInt($("#"+widget_id).css("borderTopRightRadius"),10))
    $('#bradius-bottom').val(parseInt($("#"+widget_id).css("borderBottomRightRadius"),10))
    $('#bradius-left').val(parseInt($("#"+widget_id).css("borderBottomLeftRadius"),10))
}
function PropertyBarSectionValue(widget_id) {
    if($('#'+widget_id).hasClass('lp-section-fullwidth')){
        $('#content-width').val('full');
        $('.range-block#section-width-range').hide();
    } else {
        $('#content-width').val('container');
        let con_wid = $('#'+widget_id).css('width');
        $('.range-block#section-width-range').show();
        $('#container-width-r').val(parseInt(con_wid,10));
        $('#container-width').val(parseInt(con_wid,10));
    }
    if($('#'+widget_id).hasClass('mx-auto')){
    $('#section-h-align').val('middle');
    } else if($('#'+widget_id).hasClass('ml-auto')){
        $('#section-h-align').val('end');
    } else $('#section-h-align').val('start');
    
    if($('#'+widget_id).hasClass('lp-section-fullheight')){
        $('#section-height-select').val('fit-to-screen');
        $('.range-block#section-height-range').hide();
    } else if($('#'+widget_id).hasClass('lp-section-minheight')){
        $('.range-block#section-height-range').show();
        $('#section-height-select').val('min-height');
        let con_h = $('#'+widget_id).css('height')
        $('#min-height-r').val(parseInt(con_h,10));
        $('#min-height').val(parseInt(con_h,10));
    } else {
        $('#section-height-select').val('default');
        $('.range-block#section-height-range').hide();
    }
    
    $('#section-overflow').val($('#'+widget_id).css('overflow'));
    $('#section-html').val($('#'+widget_id).prop("tagName").toLowerCase());
    $('#col-no').val($('#'+widget_id).find(".lp-section-inner").children().length);


}
function PropertyBarHeadingValue(widget_id) {
    text = $("#"+widget_id).text().replace(/(?:\r\n|\r|\n)/g, '').replace(/\s+/g," ");
    $('#content-text-input').val(text);
    $('#heading-html').val($('#'+widget_id).prop("tagName").toLowerCase());
    $('#heading-alignment').val($("#"+widget_id).css('text-align'));
    $('.font-select span').text($("#"+widget_id).css('font-family'));

    $('#content-font-decoration').val($("#"+widget_id).css('text-decoration').split(' ')[0]);
    $('#content-font-transform').val($("#"+widget_id).css('text-transform'));
    $('#content-font-style').val($("#"+widget_id).css('font-style'));
    GetHeadingTypography(widget_id);

}
function GetHeadingTypography(widget_id){
    $('#content-font-size').val(parseInt($("#"+widget_id).css('font-size'),10));
    $('#content-font-lineheight').val(parseInt($("#"+widget_id).css('line-height'),10));
    $('#content-font-letterspacing').val(parseInt($("#"+widget_id).css('letter-spacing'),10));
    $('#content-font-weight').val($("#"+widget_id).css('font-weight'));
}
function getWidgetProperties(widget_id) {
    propValues = {};
    propValues.backgroundColor = $("#"+widget_id).css("background-color");
    propValues.widgetColor = $("#"+widget_id).css("color");
    propValues.marginLeft = $("#"+widget_id).css("marginLeft");
    propValues.marginTop = $("#"+widget_id).css("marginTop");
    propValues.marginRight = $("#"+widget_id).css("marginRight");
    propValues.marginBottom = $("#"+widget_id).css("marginBottom");
    propValues.paddingLeft = $("#"+widget_id).css("paddingLeft");
    propValues.paddingTop = $("#"+widget_id).css("paddingTop");
    propValues.paddingRight = $("#"+widget_id).css("paddingRight");
    propValues.paddingBottom = $("#"+widget_id).css("paddingBottom");
    propValues.position = $("#"+widget_id).css("position");;
    propValues.zIndex = $("#"+widget_id).css("z-index");
    propValues.shadow = $("#"+widget_id).css("box-shadow");
    propValues.borderLeft = $("#"+widget_id).css("borderLeft");
    propValues.borderTop = $("#"+widget_id).css("borderTop");
    propValues.borderRight = $("#"+widget_id).css("borderRight");
    propValues.borderBottom = $("#"+widget_id).css("borderBottom");
    propValues.borderTopLeftRadius = $("#"+widget_id).css("borderTopLeftRadius");
    propValues.borderTopRightRadius = $("#"+widget_id).css("borderTopRightRadius");
    propValues.borderBottomLeftRadius = $("#"+widget_id).css("borderBottomLeftRadius");
    propValues.borderBottomRightRadius = $("#"+widget_id).css("borderBottomRightRadius");
    propValues.text = $("#"+widget_id).text().replace(/(?:\r\n|\r|\n)/g, '').replace(/\s+/g," ");

    console.log(propValues);
    return propValues;
}


//Function to convert a rgb/rgba (opacity ignored) color to hex format
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

// const common_array = [widget_color, background_color, border_properties, mpz_properties, shadow_properties];
const es_array = ['section_width', 'section_height', 'no_of_columns'];
const ec_array = [];
const eh_array = ['content_text', 'content_font', 'content_typography'];
const all_other = es_array.concat(eh_array);
$.each(all_other, function(i, v){
    $("#" + v).hide();
})

// function to show proper fields in properties bar
function showProperties(widget_id){
    $.each(all_other, function(i, v){
        $("#" + v).hide();
    })
    w = widget_id.substr(0,2);
    $.each(eval(w+'_array'), function(i, v){
        $("#" + v).show();
    })
    $('#property-bar').removeClass('hide').attr('data-id', widget_id);
}

// Add frame
function addFrame(widget_id){
    let target = $('#'+widget_id).find(".lp-widget-overlay");
    $('#'+widget_id).removeClass('widget-frame');
    $('#'+widget_id).parent().removeClass('widget-frame');
    $('#'+widget_id).parent().parent().removeClass('widget-frame');

    let wrap = '';
    curWidget = getWidget(widget_id);

    if(curWidget == 'column'){
        wrap = target.parent();
    } else { 
        wrap = target.parent().parent();
    }
        wrap.addClass('widget-frame');

}
// function to make column droppable
function columnDroppable(){
    $('.lp-section-column').droppable({
        accept: ".widget",
        drop: function (event, ui) {
            let w_id = $(ui.draggable).attr('id');
            if(w_id == 'section'){
                if(widget_id){
                    $('#'+widget_id).parent().removeClass('widget-frame');
                }
                //generate unique id for section with prefix 'es'
                widget_id = 'es'+ Math.floor(10000 + Math.random() * 90000);
                //create section from section template
                $(this).before([{vartag: 'div', varclass: 'lp-section lp-secion-widget lp-section-fullwidth', varid: widget_id}].map(section).join(''))
                
                //show propertybar with currently added section id
                showProperties(widget_id);
                PropertyBarSectionValue(widget_id);
                PropertyBarAutoValue(widget_id);
                columnDroppable();
            } else if(w_id == 'heading'){
                widget_id = 'eh'+ Math.floor(10000 + Math.random() * 90000);
                $(this).append([{vartag: 'h2', varclass: 'lp-heading lp-heading-widget', varid: widget_id, varcontent: 'This is a Heading'}].map(heading).join(''));
                // $('.lp-heading').draggable();
                showProperties(widget_id);
                PropertyBarHeadingValue(widget_id);
                PropertyBarAutoValue(widget_id);
            } else if(w_id == 'editor'){
                widget_id = 'ee'+ Math.floor(10000 + Math.random() * 90000);
                $(this).append('<div class="lp-widget-wrap"><div class="lp-widget-overlay" data-id="'+widget_id+'"></div><div class="summernote" id="'+widget_id+'">Write something here..</div></div>');
                $('.summernote').summernote({
                    minHeight: 150, //you don't need it is just an example
                    maxHeight: null,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'italic', 'subscript', 'superscript', 'clear']],
                    ['color', ['color']],
                    ['para', ['ol', 'ul', 'paragraph']],
                    ['table', ['table']],
                    ['insert', ['hr']],
                    ['view', ['fullscreen']]
                  ], //you don't need it is just an example
                    callbacks: {
                        onBlur: function (e) {
                            var p = e.target.parentNode.parentNode
                            if (!(e.relatedTarget && $.contains(p, e.relatedTarget))) {
                                $(this).parent().children('.note-editor').children('.note-toolbar').css("display", "none");;
                              console.log("onBlur");
                            }
                        },
                      onFocus: function (e) {
                        $(this).parent().children('.note-editor').children('.note-toolbar').css("display", "block");
                      }
                    }
              });
              

            } else {
                alert("Currently only heading is accepted...");
            }
        }
    });
}
// // function to make column droppable
// function columnDroppable(){
//     $('.lp-section-column').droppable({
//         accept: ".widget",
//         drop: function (event, ui) {
//             let w_id = $(ui.draggable).attr('id');
//             if(w_id == 'heading'){
//                 widget_id = 'eh'+ Math.floor(10000 + Math.random() * 90000);
//                 $(this).append([{vartag: 'h2', varclass: 'lp-heading lp-heading-widget', varid: widget_id, varcontent: 'This is a Heading'}].map(heading).join(''));
//                 // $('.lp-heading').draggable();
//                 showProperties(widget_id);
//                 PropertyBarHeadingValue(widget_id)
//             } else {
//                 alert("Only heading accepted...");
//             }
//         }
//     });
// }


});