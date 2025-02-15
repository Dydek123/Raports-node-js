// Add New Comment auto resize textarea
function getScrollHeight(elm){
    let savedValue = elm.value
    elm.value = ''
    elm._baseScrollHeight = elm.scrollHeight
    elm.value = savedValue
}

function onExpandableTextareaInput({ target:elm }){
    // make sure the input event originated from a textarea and it's desired to be auto-expandable
    if( !elm.classList.contains('autoExpand')) return

    let minRows = elm.getAttribute('data-min-rows')|0, rows;
    !elm._baseScrollHeight && getScrollHeight(elm)
    elm.rows = minRows
    rows = Math.ceil((elm.scrollHeight - elm._baseScrollHeight) / 18)
    elm.rows = minRows + rows
}

// global delegated event listener
document.addEventListener('input', onExpandableTextareaInput)