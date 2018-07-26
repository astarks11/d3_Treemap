// HINT: Consider starting with a smaller, hand-written version of a tree, instead
// of the one in flare.js.

var data = flare;

//////////////////////////////////////////////////////////////////////////////

function setTreeSize(tree)
{
    if (tree.children !== undefined) {
        var size = 0;
        for (var i=0; i<tree.children.length; ++i) {
            size += setTreeSize(tree.children[i]);
        }
        tree.size = size;
    }
    if (tree.children === undefined) {
        // do nothing, tree.size is already defined for leaves
    }
    return tree.size;
};

function setTreeCount(tree)
{
    if (tree.children !== undefined) {
        var count = 0;
        for (var i=0; i<tree.children.length; ++i) {
            count += setTreeCount(tree.children[i]);
        }
        tree.count = count;
    }
    if (tree.children === undefined) {
        tree.count = 1;
    }
    return tree.count;
}

    var currColor = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
    var currDepth = 0;
function setTreeDepth(tree, depth)
{
    tree.depth = depth;
    if (depth != currDepth) {
        currColor = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
        currDepth = depth;
    }
    tree.mycolor = currColor;
    if (tree.children !== undefined) {
        var currLarge = 0;
        for (var i = 0; i < tree.children.length; i++) {
            var myDepth = setTreeDepth(tree.children[i],depth+1);

            if (myDepth > currLarge)
                currLarge = myDepth;

        }
        return currLarge;
    } else {
        return depth;
    }
};

setTreeSize(data);
setTreeCount(data);
var maxDepth = setTreeDepth(data, 0);



//////////////////////////////////////////////////////////////////////////////
// THIS IS THE MAIN CODE FOR THE TREEMAPPING TECHNIQUE

function setRectangles(rect, tree, attrFun)
{
    var i;
    tree.rect = rect;

    if (tree.children !== undefined) {
        var cumulativeSizes = [0];
        for (i=0; i<tree.children.length; ++i) {
            cumulativeSizes.push(cumulativeSizes[i] + attrFun(tree.children[i]));
        }
        var height = rect.y2 - rect.y1, width = rect.x2 - rect.x1;
        var scale = d3.scaleLinear()
                .domain([0, cumulativeSizes[cumulativeSizes.length-1]]);

        var border = 5;
        
        if (tree.depth%2==0) {
            scale.range([rect.x1,rect.x2]);
        } else {
            scale.range([rect.y1,rect.y2]);
        }
        // scale depending on level 

        // WRITE THIS PART.
        // the range is set once and determines the size of the x2,y2 values that are added to the current x1,y1 locations
        // hint: set the range of the "scale" variable above appropriately,
        // depending on the shape of the current rectangle.
   
        for (i=0; i<tree.children.length; ++i) {
            // start by scaling vertically // every level in, split other direction

            var newRect;
            if (tree.depth%2==0) {
                newRect = { x1: scale(cumulativeSizes[i]), x2: scale(cumulativeSizes[i+1]), y1: rect.y1, y2: rect.y2 };
            } else {
                newRect = { x1: rect.x1, x2: rect.x2, y1: scale(cumulativeSizes[i]), y2: scale(cumulativeSizes[i+1]) };                
            }
            setRectangles(newRect, tree.children[i], attrFun);

        }
    }
}

var width = window.innerWidth;
var height = window.innerHeight;

setRectangles(
    {x1: 0, x2: width, y1: 0, y2: height}, data,
    function(t) { return t.size; }
);

function makeTreeNodeList(tree, lst)
{
    lst.push(tree);
    if (tree.children !== undefined) {
        for (var i=0; i<tree.children.length; ++i) {
            makeTreeNodeList(tree.children[i], lst);
        }
    }
}

var treeNodeList = [];
makeTreeNodeList(data, treeNodeList);

var gs = d3.select("#svg")
        .attr("width", width)
        .attr("height", height)
        .selectAll("g")
        .data(treeNodeList)
        .enter()
        .append("g");

var myMargin=maxDepth;
var currDepth = 0;
var currDepthColor ='rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';

function setAttrs(sel) {
    // WRITE THIS PART. //should only have to translate from x1, to x x2-x1 to width
    sel.attr("width", function(treeNode) { 
        var val =treeNode.rect.x2 - treeNode.rect.x1-(myMargin*treeNode.depth);
        if (val > 0) {
            return val;
        } else {
            return 1;
        }
    }).attr("height", function(treeNode) {
        var val = treeNode.rect.y2 - treeNode.rect.y1-(myMargin*treeNode.depth);
        if (val > 0) {
            return val;
        } else {
            return 1;
        }

    }).attr("x", function(treeNode) {
        return treeNode.rect.x1+(myMargin*treeNode.depth/2);
    }).attr("y", function(treeNode) {
        return treeNode.rect.y1+(myMargin*treeNode.depth/2);
    }).attr("fill", function(treeNode) {
        return treeNode.mycolor;
    }).attr("stroke", function(treeNode) {
        return "white";
    }).attr("title", function(treeNode) {
        return treeNode.name;
    });
}
//console.log(Object.getOwnPropertyNames(treeNode));

gs.append("rect").call(setAttrs);

d3.select("#size").on("click", function() {
    setRectangles(
        {x1: 0, x2: width, y1: 0, y2: height}, data,
        function(t) { return t.size; }
    );
    d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});

d3.select("#count").on("click", function() {
    setRectangles(
        {x1: 0, x2: width, y1: 0, y2: height}, data,
        function(t) { return t.count; }
    );
    d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});