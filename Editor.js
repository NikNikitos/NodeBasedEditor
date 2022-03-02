function toggleSidebar(ref){
  document.getElementById("sidebar").classList.toggle('active');
}

document.onload = (function(d3, saveAs, Blob, undefined){
    "use strict";
 
    // define graphcreator object
    var GraphCreator = function(svg, nodes, edges, entities){
      var thisGraph = this;
          thisGraph.idct = 0;
      
      thisGraph.nodes = nodes || [];
      thisGraph.edges = edges || [];
	  thisGraph.entities = entities || [];
	  
	
	
      
      thisGraph.state = {
        selectedNode: null,
        selectedEdge: null,
        mouseDownNode: null,
        mouseDownLink: null,
        justDragged: false,
        justScaleTransGraph: false,
        lastKeyDown: -1,
        shiftNodeDrag: false,
        selectedText: null
      };
  
      // define arrow markers for graph links
      var defs = svg.append('svg:defs');
      defs.append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', "32")
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');
  
      // define arrow markers for leading arrow
      defs.append('svg:marker')
        .attr('id', 'mark-end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 7)
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');
  
      thisGraph.svg = svg;
      thisGraph.svgG = svg.append("g")
            .classed(thisGraph.consts.graphClass, true);
      var svgG = thisGraph.svgG;
  
      // displayed when dragging between nodes
      thisGraph.dragLine = svgG.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0')
            .style('marker-end', 'url(#mark-end-arrow)');
  
      // svg nodes and edges 
      thisGraph.paths = svgG.append("g").selectAll("g");
      thisGraph.circles = svgG.append("g").selectAll("g");
  
      thisGraph.drag = d3.behavior.drag()
            .origin(function(d){
              return {x: d.x, y: d.y};
            })
            .on("drag", function(args){
              thisGraph.state.justDragged = true;
              thisGraph.dragmove.call(thisGraph, args);
            })
            .on("dragend", function() {
              // todo check if edge-mode is selected
            });
  
      // listen for key events
      d3.select(window).on("keydown", function(){
        thisGraph.svgKeyDown.call(thisGraph);
      })
      .on("keyup", function(){
        thisGraph.svgKeyUp.call(thisGraph);
      });
      svg.on("mousedown", function(d){thisGraph.svgMouseDown.call(thisGraph, d);});
      svg.on("mouseup", function(d){thisGraph.svgMouseUp.call(thisGraph, d);});
  
      // listen for dragging
      var dragSvg = d3.behavior.zoom()
            .on("zoom", function(){
              if (d3.event.sourceEvent.shiftKey){
                // TODO  the internal d3 state is still changing
                return false;
              } else{
                thisGraph.zoomed.call(thisGraph);
              }
              return true;
            })
            .on("zoomstart", function(){
              var ael = d3.select("#" + thisGraph.consts.activeEditId).node();
              if (ael){
                ael.blur();
              }
              if (!d3.event.sourceEvent.shiftKey) d3.select('body').style("cursor", "move");
            })
            .on("zoomend", function(){
              d3.select('body').style("cursor", "auto");
            });
      
      svg.call(dragSvg).on("dblclick.zoom", null);
  
      // listen for resize
      window.onresize = function(){thisGraph.updateWindow(svg);};
  
      // handle download data
      d3.select("#download-input").on("click", function(){
        var saveEdges = [];
        thisGraph.edges.forEach(function(val, i){
          saveEdges.push({source: val.source.id, target: val.target.id});
        });
        var blob = new Blob([window.JSON.stringify({"nodes": thisGraph.nodes, "edges": saveEdges, "entities": thisGraph.entities})], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "mydag.json");
      });
  
  
	radiogroup.onclick = function(event) {
		let target = event.target; // где был клик?

		if (target.tagName != 'INPUT') return; // не на TD? тогда не интересует
		
		
		
		d3.selectAll("input[name='radio']").on("change", function(){
         var saveEdges = [];
        thisGraph.edges.forEach(function(val, i){
          saveEdges.push({source: val.source.id, target: val.target.id});
        });
        var blob = new Blob([window.JSON.stringify({"nodes": thisGraph.nodes, "edges": saveEdges, "entities": thisGraph.entities})], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "mydag.json");
		
		document.getElementById("hidden-file-upload").click();
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          var uploadFile = this.files[0];
          var filereader = new window.FileReader();
          
          filereader.onload = function(){
            var txtRes = filereader.result;
            // TODO better error handling
            try{
              var jsonObj = JSON.parse(txtRes);
              thisGraph.deleteGraph(true);
              thisGraph.nodes = jsonObj.nodes;
			  thisGraph.entities = jsonObj.entities;
              thisGraph.setIdCt(jsonObj.nodes.length + 1);
              var newEdges = jsonObj.edges;
              newEdges.forEach(function(e, i){
                newEdges[i] = {source: thisGraph.nodes.filter(function(n){return n.id == e.source;})[0],
                            target: thisGraph.nodes.filter(function(n){return n.id == e.target;})[0]};
              });
              thisGraph.edges = newEdges;
              thisGraph.updateGraph();
            }catch(err){
              window.alert("Error parsing uploaded file\nerror message: " + err.message);
              return;
            }
          };
          filereader.readAsText(uploadFile);
          
        } else {
          alert("Your browser won't let you save this graph -- try upgrading your browser to IE 10+ or Chrome or Firefox.");
        }
      });
	}
      // handle uploaded data
      d3.select("#upload-input").on("click", function(){
        document.getElementById("hidden-file-upload").click();
      });
      d3.select("#hidden-file-upload").on("change", function(){
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          var uploadFile = this.files[0];
          var filereader = new window.FileReader();
          
          filereader.onload = function(){
            var txtRes = filereader.result;
            // TODO better error handling
            try{
              var jsonObj = JSON.parse(txtRes);
              thisGraph.deleteGraph(true);
              thisGraph.nodes = jsonObj.nodes;
			  thisGraph.entities = jsonObj.entities;
              thisGraph.setIdCt(jsonObj.nodes.length + 1);
              var newEdges = jsonObj.edges;
              newEdges.forEach(function(e, i){
                newEdges[i] = {source: thisGraph.nodes.filter(function(n){return n.id == e.source;})[0],
                            target: thisGraph.nodes.filter(function(n){return n.id == e.target;})[0]};
              });
              thisGraph.edges = newEdges;
              thisGraph.updateGraph();
            }catch(err){
              window.alert("Error parsing uploaded file\nerror message: " + err.message);
              return;
            }
          };
          filereader.readAsText(uploadFile);
          
        } else {
          alert("Your browser won't let you save this graph -- try upgrading your browser to IE 10+ or Chrome or Firefox.");
        }
  
      });
  
      // handle delete graph
      d3.select("#delete-graph").on("click", function(){
        thisGraph.deleteGraph(false);
      });
    };
  
    GraphCreator.prototype.setIdCt = function(idct){
      this.idct = idct;
    };
  
    GraphCreator.prototype.consts =  {
      selectedClass: "selected",
      connectClass: "connect-node",
      circleGClass: "conceptG",
      graphClass: "graph",
      activeEditId: "active-editing",
      BACKSPACE_KEY: 8,
      DELETE_KEY: 46,
      ENTER_KEY: 13,
      nodeRadius: 50,
      nodeWidth: 100,
      nodeHeight: 50

    };
  
    /* PROTOTYPE FUNCTIONS */
  
    GraphCreator.prototype.dragmove = function(d) {
      var thisGraph = this;
      if (thisGraph.state.shiftNodeDrag){
        thisGraph.dragLine.attr('d', 'M' + d.value.x + ',' + d.value.y + 'L' + d3.mouse(thisGraph.svgG.node())[0] + ',' + d3.mouse(this.svgG.node())[1]);
      } else{
        d.x += d3.event.dx;
        d.y +=  d3.event.dy;
        thisGraph.updateGraph();
      }
    };
  
    GraphCreator.prototype.deleteGraph = function(skipPrompt){
      var thisGraph = this,
          doDelete = true;
      if (!skipPrompt){
        doDelete = window.confirm("Press OK to delete this graph");
      }
      if(doDelete){
        thisGraph.nodes = [];
        thisGraph.edges = [];
        thisGraph.updateGraph();
      }
    };
  
    /* select all text in element: taken from http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element */
    GraphCreator.prototype.selectElementContents = function(el) {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
  
  
    /* insert svg line breaks: taken from http://stackoverflow.com/questions/13241475/how-do-i-include-newlines-in-labels-in-d3-charts */
    GraphCreator.prototype.insertTitleLinebreaks = function (gEl, title) {
      var words = title.split(/\s+/g),
          nwords = words.length;
      var el = gEl.append("text")
            .attr("text-anchor","middle")
            .attr("dy", "-" + (nwords-1)*7.5);
  
      for (var i = 0; i < words.length; i++) {
        var tspan = el.append('tspan').text(words[i]);
        if (i > 0)
          tspan.attr('x', 0).attr('dy', '15');
      }
    };
  
    
    // remove edges associated with a node
    GraphCreator.prototype.spliceLinksForNode = function(node) {
      var thisGraph = this,
          toSplice = thisGraph.edges.filter(function(l) {
        return (l.source === node || l.target === node);
      });
      toSplice.map(function(l) {
        thisGraph.edges.splice(thisGraph.edges.indexOf(l), 1);
      });
    };
  
    GraphCreator.prototype.replaceSelectEdge = function(d3Path, edgeData){
      var thisGraph = this;
      d3Path.classed(thisGraph.consts.selectedClass, true);
      if (thisGraph.state.selectedEdge){
        thisGraph.removeSelectFromEdge();
      }
      thisGraph.state.selectedEdge = edgeData;
    };
  
    GraphCreator.prototype.replaceSelectNode = function(d3Node, nodeData){
      var thisGraph = this;
      d3Node.classed(this.consts.selectedClass, true);
      if (thisGraph.state.selectedNode){
        thisGraph.removeSelectFromNode();
      }
      thisGraph.state.selectedNode = nodeData;
    };
    
    GraphCreator.prototype.removeSelectFromNode = function(){
      var thisGraph = this;
      thisGraph.circles.filter(function(cd){
        return cd.id === thisGraph.state.selectedNode.id;
      }).classed(thisGraph.consts.selectedClass, false);
      thisGraph.state.selectedNode = null;
    };
  
    GraphCreator.prototype.removeSelectFromEdge = function(){
      var thisGraph = this;
      thisGraph.paths.filter(function(cd){
        return cd === thisGraph.state.selectedEdge;
      }).classed(thisGraph.consts.selectedClass, false);
      thisGraph.state.selectedEdge = null;
    };
  
    GraphCreator.prototype.pathMouseDown = function(d3path, d){
      var thisGraph = this,
          state = thisGraph.state;
      d3.event.stopPropagation();
      state.mouseDownLink = d;
  
      if (state.selectedNode){
        thisGraph.removeSelectFromNode();
      }
      
      var prevEdge = state.selectedEdge;  
      if (!prevEdge || prevEdge !== d){
        thisGraph.replaceSelectEdge(d3path, d);
      } else{
        thisGraph.removeSelectFromEdge();
      }
    };
  
    // mousedown on node
    GraphCreator.prototype.circleMouseDown = function(d3node, d){
      var thisGraph = this,
          state = thisGraph.state;
      d3.event.stopPropagation();
      state.mouseDownNode = d;
	  //console.log(d.value.x);
	    //console.log(d.x);
      if (d3.event.shiftKey){
        state.shiftNodeDrag = d3.event.shiftKey;
        // reposition dragged directed edge
        thisGraph.dragLine.classed('hidden', false)
          .attr('d', 'M' + d.value.x + ',' + d.value.y + 'L' + d.value.x + ',' + d.value.y);
        return;
      }
    };
  
    /* place editable text on node in place of svg text */
    GraphCreator.prototype.changeTextOfNode = function(d3node, d){
      var thisGraph= this,
          consts = thisGraph.consts,
          htmlEl = d3node.node();
      d3node.selectAll("text").remove();
      var nodeBCR = htmlEl.getBoundingClientRect(),
          curScale = nodeBCR.width/consts.nodeRadius,
          placePad  =  5*curScale,
          useHW = curScale > 1 ? nodeBCR.width*0.71 : consts.nodeRadius*1.42;
      // replace with editableconent text
      var d3txt = thisGraph.svg.selectAll("foreignObject")
            .data([d])
            .enter()
            .append("foreignObject")
            .attr("x", nodeBCR.left + placePad )
            .attr("y", nodeBCR.top + placePad)
            .attr("height", 2*useHW)
            .attr("width", useHW)
            .append("xhtml:p")
            .attr("id", consts.activeEditId)
            .attr("contentEditable", "true")
            .text(d.title)
            .on("mousedown", function(d){
              d3.event.stopPropagation();
            })
            .on("keydown", function(d){
              d3.event.stopPropagation();
              if (d3.event.keyCode == consts.ENTER_KEY && !d3.event.shiftKey){
                this.blur();
              }
            })
            .on("blur", function(d){
              d.title = this.textContent;
              thisGraph.insertTitleLinebreaks(d3node, d.title);
              d3.select(this.parentElement).remove();
            });
      return d3txt;
    };
  
    // mouseup on nodes
    GraphCreator.prototype.circleMouseUp = function(d3node, d){
      var thisGraph = this,
          state = thisGraph.state,
          consts = thisGraph.consts;
      // reset the states
      state.shiftNodeDrag = false;    
      d3node.classed(consts.connectClass, false);
      
      var mouseDownNode = state.mouseDownNode;
      
      if (!mouseDownNode) return;
  
      thisGraph.dragLine.classed("hidden", true);
	console.log(mouseDownNode.value, d.value);
      if (mouseDownNode.value !== d.value){
        // we're in a different node: create new edge for mousedown edge and add to graph
        var newEdge = {source: mouseDownNode.value, target: d.value};
		console.log(newEdge)
        var filtRes = thisGraph.paths.filter(function(d){
          if (d.source === newEdge.target && d.target === newEdge.source){
            thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
          }
          return d.source === newEdge.source && d.target === newEdge.target;
        });
        if (!filtRes[0].length){
          thisGraph.edges.push(newEdge);
          thisGraph.updateGraph();
        }
      } else{
		  console.log("same")
        // we're in the same node
        if (state.justDragged) {
          // dragged, not clicked
          state.justDragged = false;
        } else{
          // clicked, not dragged
          if (d3.event.shiftKey){
            // shift-clicked node: edit text content
            var d3txt = thisGraph.changeTextOfNode(d3node, d);
            var txtNode = d3txt.node();
            thisGraph.selectElementContents(txtNode);
            txtNode.focus();
          } else{
            if (state.selectedEdge){
              thisGraph.removeSelectFromEdge();
            }
            var prevNode = state.selectedNode;            
            
            if (!prevNode || prevNode.id !== d.id){
              thisGraph.replaceSelectNode(d3node, d);
            } else{
              thisGraph.removeSelectFromNode();
            }
          }
        }
      }
      state.mouseDownNode = null;
      return;
      
    }; // end of circles mouseup
  
    // mousedown on main svg
    GraphCreator.prototype.svgMouseDown = function(){
      this.state.graphMouseDown = true;
    };
  
    // mouseup on main svg
    GraphCreator.prototype.svgMouseUp = function(){
      var thisGraph = this,
          state = thisGraph.state;
      if (state.justScaleTransGraph) {
        // dragged not clicked
        state.justScaleTransGraph = false;
      } else if (state.graphMouseDown && d3.event.shiftKey){
        // clicked not dragged from svg
        var xycoords = d3.mouse(thisGraph.svgG.node()),
            d = {id: thisGraph.idct++,title: "New", x: xycoords[0], y: xycoords[1], nodes: thisGraph.nodes};
		thisGraph.entities.push(d);
        //thisGraph.nodes.push(d);
        thisGraph.updateGraph();
        // make title of text immediently editable
        var d3txt = thisGraph.changeTextOfNode(thisGraph.circles.filter(function(dval){
          return dval.id === d.id;
        }), d),
            txtNode = d3txt.node();
        thisGraph.selectElementContents(txtNode);
        txtNode.focus();
      } else if (state.shiftNodeDrag){
        // dragged from node
        state.shiftNodeDrag = false;
        thisGraph.dragLine.classed("hidden", true);
      }
      state.graphMouseDown = false;
    };
  
    // keydown on main svg
    GraphCreator.prototype.svgKeyDown = function() {
      var thisGraph = this,
          state = thisGraph.state,
          consts = thisGraph.consts;
      // make sure repeated key presses don't register for each keydown
      if(state.lastKeyDown !== -1) return;
  
      state.lastKeyDown = d3.event.keyCode;
      var selectedNode = state.selectedNode,
          selectedEdge = state.selectedEdge;
  
      switch(d3.event.keyCode) {
      case consts.BACKSPACE_KEY:
      case consts.DELETE_KEY:
        d3.event.preventDefault();
        if (selectedNode){
          thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
          thisGraph.spliceLinksForNode(selectedNode);
          state.selectedNode = null;
          thisGraph.updateGraph();
        } else if (selectedEdge){
          thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);
          state.selectedEdge = null;
          thisGraph.updateGraph();
        }
        break;
      }
    };
  
    GraphCreator.prototype.svgKeyUp = function() {
      this.state.lastKeyDown = -1;
    };
	
	
	GraphCreator.prototype.buildOneLinkEntity = function(){
      var thisGraph = this,
          state = thisGraph.state;
		  
		 var  temp = {title: "New",id: thisGraph.idct++, x: 0, y: 0, inX: 0, inY: 50};
	
        thisGraph.nodes.push(temp);
		  console.log(thisGraph.nodes)
		  
	var te = [];
	te.push(thisGraph.nodes[(Object.keys(thisGraph.nodes).length)-1]);

	//console.log(thisGraph.nodes[thisGraph.nodes.length])
	//console.log(Object.keys(thisGraph.nodes).length)
      var d = {id: thisGraph.idct++,title: "New", x: 100, y: 100, nodes: te};
	  thisGraph.entities.push(d);
      
        thisGraph.updateGraph();
      
    };
	GraphCreator.prototype.buildTwoLinkEntity = function(){
      var thisGraph = this,
          state = thisGraph.state;
	var temp = [];
	temp.push(thisGraph.nodes[0]);
	temp.push(thisGraph.nodes[1]);
	
      var d = {id: thisGraph.idct++,title: "New", x: 100, y: 100, nodes: temp};
	  thisGraph.entities.push(d);
      
        thisGraph.updateGraph();
      
    };
	GraphCreator.prototype.buildThreeLinkEntity = function(){
      var thisGraph = this,
          state = thisGraph.state;
	var temp = [];
	temp.push(thisGraph.nodes[0]);
	temp.push(thisGraph.nodes[1]);
	temp.push(thisGraph.nodes[3]);
	
      var d = {id: thisGraph.idct++,title: "New", x: 100, y: 100, nodes: temp};
	  thisGraph.entities.push(d);
      
        thisGraph.updateGraph();
      
    };
	
	GraphCreator.prototype.setInfo = function(d3node, d){
      var thisGraph = this,
          state = thisGraph.state;
		  
    var result = Object.entries(d);
	
	 
	 
	 var sel = d3.select('#info').selectAll('li');
	 
	sel.data(result).enter().append('li');
// Update
sel.data(result).text( function(d){ return d; });
// Exit
sel.data(result).exit().remove();

	
    };
  
    // call to propagate changes to graph
    GraphCreator.prototype.updateGraph = function(){
      
      var thisGraph = this,
          consts = thisGraph.consts,
          state = thisGraph.state;
      
	  //console.log(thisGraph.entitites.nodes[0]);
	  
      thisGraph.paths = thisGraph.paths.data(thisGraph.edges, function(d){
        return String(d.source.id) + "+" + String(d.target.id);
      });
      var paths = thisGraph.paths;
      // update existing paths
      paths.style('marker-end', 'url(#end-arrow)')
        .classed(consts.selectedClass, function(d){
          return d === state.selectedEdge;
        })
        .attr("d", function(d){
         
          var s =  d.source.x + consts.nodeWidth/2;
          return "M" + s  + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        });
  
      // add new paths
      paths.enter()
        .append("path")
        .style('marker-end','url(#end-arrow)')
        .classed("link", true)
        .attr("d", function(d){
			
          return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        })
        .on("mousedown", function(d){
          thisGraph.pathMouseDown.call(thisGraph, d3.select(this), d);
          }
        )
        .on("mouseup", function(d){
          state.mouseDownLink = null;
        });
  
      // remove old links
      paths.exit().remove();
      
	  /*
      // update existing nodes
      thisGraph.circles = thisGraph.circles.data(thisGraph.nodes, function(d){ return d.id;});
      thisGraph.circles.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";});

	
      // add new nodes
      var newGs= thisGraph.circles.enter()
            .append("g");
  
      newGs.classed(consts.circleGClass, true)
        .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
        .on("mouseover", function(d){        
          if (state.shiftNodeDrag){
            d3.select(this).classed(consts.connectClass, true);
          }
        })
        .on("mouseout", function(d){
          d3.select(this).classed(consts.connectClass, false);
        })
        .on("mousedown", function(d){
          thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d);
        })
        .on("mouseup", function(d){
          thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d);
        })
        .call(thisGraph.drag);
  
      newGs.append("rect")
        .attr("width", String(consts.nodeWidth))
        .attr("height", String(consts.nodeHeight));
  
      newGs.each(function(d){
        thisGraph.insertTitleLinebreaks(d3.select(this), d.title);
      });
  
      // remove old nodes
      thisGraph.circles.exit().remove();
	  
	  */
	  thisGraph.circles = thisGraph.circles.data(thisGraph.entities, function(d){ return d.id;});
      thisGraph.circles.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";});
	  
	  
	  var newGroups  = thisGraph.circles
	   .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
		.enter()
		.append("g")
		.call(thisGraph.drag)
		.on("mousedown", function(d){
          d3.event.stopPropagation();
		  thisGraph.setInfo.call(thisGraph, d3.select(this), d);
        })
		.on("mouseup", function(d){
          d.nodes.forEach(
			function sumNumber( val ) {
				val.x = d.x + val.inX;
				val.y = d.y + val.inY;
			});
        })

	var unity = newGroups
		.classed("container", true)
		.append("rect")
		.attr("width", 150)
		.attr("height", 100)
		
		
		
	
	var rect = newGroups.selectAll(null)
		.data(function(d) {return d3.entries(d.nodes) })
		.enter()
		.append("circle")
		.classed("connector", true)
  
	rect.attr("r", 15)
		
		.attr("cx", function(d) {return d.value.inX; })
		.attr("cy", function(d) {return d.value.inY; })
		.on("mousedown", function(d){
          thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d);
        })
		.on("mouseup", function(d){
          thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d);
        })
		.call(thisGraph.drag)
		
		//thisGraph.entitites.push(new Entity("fisrt", 0, 100, 100));
		
		//thisGraph.nodes.push(d);
		
		//console.log(thisGraph.circles);
		
	thisGraph.circles.exit().remove();
	//console.log(thisGraph.circles);
	  
	 /* 
	 var groups = thisGraph.svg.selectAll(null)
		.data(thisGraph.entitites, function(d){ return d.id;})
		.enter()
		.append("g")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
	var unity = groups
		.append("rect")
		.attr("width", String(consts.nodeWidth))
		.attr("height", String(consts.nodeHeight))
		.style("fill", "Aquamarine")
		.call(thisGraph.drag);
	
	var rect = groups.selectAll(null)
		.data(function(d) {return d3.entries(d.nodes) })
		.enter()
		.append("rect");
  
	rect.classed("conceptG", true)
		.attr("width", 50)
		.attr("height", 25)
		.attr("x", function(d) {return d.value.x; })
		.attr("y", function(d) {return d.value.y; })
		.style("fill", "hotpink")
		.on("mousedown", function(d){
          console.log("df",d);
        })
		*/
		
		d3.selectAll("input[name='btn']").on("click", function(){
			if(this.value == "one")
        thisGraph.buildOneLinkEntity.call(thisGraph);
			if(this.value == "two")
        thisGraph.buildTwoLinkEntity.call(thisGraph);
			if(this.value == "three")
        thisGraph.buildThreeLinkEntity.call(thisGraph);
        
      });
	  
    };
  
    GraphCreator.prototype.zoomed = function(){
      this.state.justScaleTransGraph = true;
      d3.select("." + this.consts.graphClass)
        .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")"); 
    };
  
    GraphCreator.prototype.updateWindow = function(svg){
      var docEl = document.documentElement,
          bodyEl = document.getElementsByTagName('body')[0];
      var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
      var y = window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;
      svg.attr("width", x).attr("height", y);
    };

    
    /**** MAIN ****/
  
    var docEl = document.documentElement,
        bodyEl = document.getElementsByTagName('body')[0];
    
    var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
        height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;
  
    var xLoc = width/2 - 25,
        yLoc = 100;
  
    // initial node data
    var nodes = [{title: "Premise", id: 0, x: 0, y: 33, inX: 0, inY: 33},
				{title: "second", id: 1, x: 0, y: 66, inX: 0, inY: 66},
				{title: "third", id: 2, x: 0, y: 50, inX: 0, inY: 50},
                 {title: "Conclusion", id: 3, x: 150, y: 50, inX: 150, inY: 50}];
    var edges = [{source: nodes[0], target: nodes[1]}];
	
	var n = [];
	n.push(nodes[1]);
	n.push(nodes[0]);
	var entities = [{title: "First", id: 0, x: 100, y: 100, nodes: n}];
	
	
	/////////////////////////////////////////////////
	
	var rootTabs = d3.select(".form_radio_group");
	
	add.onclick = function() {
		console.log(this.id);
		addTab();
	};
	
	function deleteTab(tabInfo){
		console.log(tabInfo.target.closest('div'));
		tabInfo.target.closest('div').remove();
	}
	
	function getTabsLength(){
		
		var el = document.querySelectorAll(".form_radio_group-item"); 
		return el.length+1;
	}
	
	function addTab(){
		
		var tabsId = getTabsLength();
		var wrapper = rootTabs.append("div")
		.attr("class", "form_radio_group-item")
		
		wrapper.append("input")
		.attr("id", "radio-"+tabsId)
		.attr("type", "radio")
		.attr("name", "radio")
		.attr("value", tabsId);
		
		var label = wrapper.append("label")
					.attr("for", "radio-"+tabsId)
					.text("Tab"+tabsId);
	
		label.append("button")
		.attr("class", "close")
		.attr("type", "button")
		.text("x");
		
		var el = document.querySelectorAll(".close"); 
		for(var i =0; i < el.length; i++) {
			el[i].onclick = function(d) {deleteTab(d)};
		}
		 //d3.selectAll("input[name='radio']").on("change", function(){
        
        //saveGraph(this);
      //});
	}
	
	function  saveGraph(val){
		
		    // var thisGraph = this;
          
		
		console.log(val);
		
		
		var saveEdges = [];
        thisGraph.edges.forEach(function(val, i){
          saveEdges.push({source: val.source.id, target: val.target.id});
        });
        var blob = new Blob([window.JSON.stringify({"nodes": thisGraph.nodes, "edges": saveEdges, "entities": thisGraph.entities})], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "mydag.json");
		
		
		 
		
	}
	
	
	/////////////////////////////////
	
	
	
	
	
  
  
  
    /** MAIN SVG **/
    var svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height);
    var graph = new GraphCreator(svg, nodes, edges, entities);
        graph.setIdCt(2);
    
	
	graph.updateGraph();
  })(window.d3, window.saveAs, window.Blob);