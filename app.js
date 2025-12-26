/*
=========================================
PHASE 2: THE "BRAIN" (LOGICAL GRAPH)
=========================================
*/
class Graph {
  constructor() {
    this.adjacencyList = new Map();
    this.walls = new Set(); 
  }

  toggleWall(nodeName) {
    if (this.walls.has(nodeName)) {
      this.walls.delete(nodeName); return false; 
    } else {
      this.walls.add(nodeName); return true; 
    }
  }

  addNode(nodeName) {
    if (!this.adjacencyList.has(nodeName)) {
      this.adjacencyList.set(nodeName, []);
    }
  }

  addEdge(node1, node2, { isBidirectional = true }) {
    if (this.adjacencyList.has(node1) && this.adjacencyList.has(node2)) {
      this.adjacencyList.get(node1).push(node2);
      if (isBidirectional) {
        this.adjacencyList.get(node2).push(node1);
      }
    }
  }

  deleteNode(nodeName) {
    if (!this.adjacencyList.has(nodeName)) return;
    for (const [node, neighbors] of this.adjacencyList.entries()) {
      const index = neighbors.indexOf(nodeName);
      if (index > -1) neighbors.splice(index, 1);
    }
    this.adjacencyList.delete(nodeName);
    this.walls.delete(nodeName);
  }

  deleteEdge(node1, node2, { isBidirectional = true }) {
    if (this.adjacencyList.has(node1) && this.adjacencyList.has(node2)) {
      let neighbors1 = this.adjacencyList.get(node1);
      let index1 = neighbors1.indexOf(node2);
      if (index1 > -1) neighbors1.splice(index1, 1);
      if (isBidirectional) {
        let neighbors2 = this.adjacencyList.get(node2);
        let index2 = neighbors2.indexOf(node1);
        if (index2 > -1) neighbors2.splice(index2, 1);
      }
    }
  }

  // Breadth-First Search (BFS) - FINAL "AWESOME" VERSION
  bfs(startNode, endNode) {
    const queue = [startNode];
    const visited = new Set();
    const parent = new Map();
    const animationSteps = []; 

    visited.add(startNode);
    parent.set(startNode, null);
    
    animationSteps.push({ type: 'log', msg: `Start BFS from '${startNode}'` });
    animationSteps.push({ type: 'visitNode', node: startNode });
    animationSteps.push({ type: 'queueUpdate', queue: [...queue] }); 
    animationSteps.push({ type: 'log', msg: `Enqueue '${startNode}'. Queue: [${queue}]` });

    let nodesVisited = 0;

    while (queue.length > 0) {
      const currentNode = queue.shift();
      nodesVisited++;
      animationSteps.push({ type: 'log', msg: `Dequeue '${currentNode}'. Visiting...` });
      animationSteps.push({ type: 'queueUpdate', queue: [...queue] }); 
      
      if (currentNode === endNode) {
        const path = [];
        let current = endNode;
        while (current !== null) {
          path.unshift(current);
          animationSteps.push({ type: 'pathNode', node: current });
          current = parent.get(current);
        }
        animationSteps.push({ type: 'log', msg: `Goal '${endNode}' found!` });
        return { path: path, animation: animationSteps, metrics: { nodesVisited: nodesVisited, pathLength: path.length } };
      }

      const neighbors = this.adjacencyList.get(currentNode);
      for (const neighbor of neighbors) {
        if (!this.walls.has(neighbor)) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            parent.set(neighbor, currentNode);
            queue.push(neighbor);
            
            animationSteps.push({ type: 'log', msg: `Found unvisited neighbor: '${neighbor}'. Enqueue.` });
            animationSteps.push({ type: 'queueUpdate', queue: [...queue] }); 
            animationSteps.push({ type: 'visitEdge', from: currentNode, to: neighbor });
            animationSteps.push({ type: 'visitNode', node: neighbor });
          }
        } 
      }
    }
    animationSteps.push({ type: 'log', msg: 'No path found.', isError: true });
    return { path: null, animation: animationSteps, metrics: { nodesVisited: nodesVisited, pathLength: 0 } };
  }

  // Depth-First Search (DFS) - FINAL "AWESOME" VERSION
  dfs(startNode, endNode) {
    const stack = [startNode]; 
    const visited = new Set();
    const parent = new Map();
    const animationSteps = []; 

    visited.add(startNode);
    parent.set(startNode, null);

    animationSteps.push({ type: 'log', msg: `Start DFS from '${startNode}'` });
    animationSteps.push({ type: 'visitNode', node: startNode });
    animationSteps.push({ type: 'stackUpdate', stack: [...stack] }); 
    animationSteps.push({ type: 'log', msg: `Push '${startNode}'. Stack: [${stack}]` });

    let nodesVisited = 0;

    while (stack.length > 0) {
      const currentNode = stack.pop(); 
      nodesVisited++;
      animationSteps.push({ type: 'log', msg: `Pop '${currentNode}'. Visiting...` });
      animationSteps.push({ type: 'stackUpdate', stack: [...stack] }); 
      
      if (currentNode === endNode) {
        const path = [];
        let current = endNode;
        while (current !== null) {
          path.unshift(current);
          animationSteps.push({ type: 'pathNode', node: current });
          current = parent.get(current);
        }
        animationSteps.push({ type: 'log', msg: `Goal '${endNode}' found!` });
        return { path: path, animation: animationSteps, metrics: { nodesVisited: nodesVisited, pathLength: path.length } };
      }

      const neighbors = this.adjacencyList.get(currentNode);
      for (const neighbor of neighbors) {
        if (!this.walls.has(neighbor)) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            parent.set(neighbor, currentNode);
            stack.push(neighbor); 

            animationSteps.push({ type: 'log', msg: `Found unvisited neighbor: '${neighbor}'. Push.` });
            animationSteps.push({ type: 'stackUpdate', stack: [...stack] }); 
            animationSteps.push({ type: 'visitEdge', from: currentNode, to: neighbor });
            animationSteps.push({ type: 'visitNode', node: neighbor });
          }
        }
      }
    }
    animationSteps.push({ type: 'log', msg: 'No path found.', isError: true });
    return { path: null, animation: animationSteps, metrics: { nodesVisited: nodesVisited, pathLength: 0 } };
  }
}

// =========================================
// PHASE 1: VISUALS & EVENT LISTENERS
// =========================================

document.addEventListener("DOMContentLoaded", function() {
  
  const logicalGraph = new Graph();

  // 2. Data Sets and State
  const nodes = new vis.DataSet([]);
  const edges = new vis.DataSet([]);
  let selectedNode = null; 
  let currentMode = 'addNode'; 
  let nodeToPlace = null; 
  let isAnimating = false; 
  let algorithmMode = 'bfs'; // 'bfs' or 'dfs'
  let startNode = null;
  let endNode = null;
  let statusHistory = []; // To store log messages

  // 3. Get the HTML elements
  const container = document.getElementById("graph-canvas");
  const startNodeSelect = document.getElementById("start-node");
  const endNodeSelect = document.getElementById("end-node");
  const edgeTypeRadios = document.getElementsByName("edge-type");
  const statusMessage = document.getElementById("status-message"); 
  const queueBox = document.getElementById("queue-box");
  const stackBox = document.getElementById("stack-box");
  const logBox = document.getElementById("log-box");
  const metricsBox = document.getElementById("metrics-box");
  
  const nodeNameInput = document.getElementById("node-name-input"); 
  const addNodeButton = document.getElementById("add-node-button"); 
  const runButton = document.getElementById("run-bfs-button");
  const dfsButton = document.getElementById("run-dfs-button");
  const wallButton = document.getElementById("toggle-wall-button");
  const deleteButton = document.getElementById("delete-mode-button");
  const clearAllButton = document.getElementById("clear-all-button");
  const sampleGraphButton = document.getElementById("load-sample-graph-button"); 
  
  // --- ADDED FOR PDF/MODALS ---
  const splashScreen = document.getElementById("splash-screen");
  const continueButton = document.getElementById("continue-button");
  
  const devButton = document.getElementById("dev-button");
  const devModal = document.getElementById("dev-modal");
  const devModalClose = document.getElementById("dev-modal-close");
  
  const learnButton = document.getElementById("learn-button");
  const learnModal = document.getElementById("learn-modal");
  const learnModalClose = document.getElementById("learn-modal-close");
  
  const helpButton = document.getElementById("help-button");
  const helpModal = document.getElementById("help-modal");
  const helpModalClose = document.getElementById("help-modal-close");
  
  const downloadButton = document.getElementById("download-button");
  
  // "Guided By" elements have been REMOVED
  // --- END OF NEW ELEMENTS ---
  
  // 4. Create the data object for vis.js
  const data = {
    nodes: nodes,
    edges: edges,
  };

  // 5. Define options
  const options = {
    physics: false,
    interaction: {
      dragView: false, 
      zoomView: false  
    },
    manipulation: {
      enabled: false,
    },
    // ...
nodes: {
  shape: "dot", 
  size: 25,     
  font: { 
    size: 18,    
    color: "#e6edf3", 
    strokeWidth: 0,   
    background: "none"
  }, 
  borderWidth: 2,
},
// ...
    edges: {
      width: 3
    }
  };

  // 6. Initialize the vis.js Network!
  const network = new vis.Network(container, data, options);
  
  // --- "Awesome" Mouse-Follow Spotlight Listener ---
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    container.style.setProperty('--mouse-x', `${x}px`);
    container.style.setProperty('--mouse-y', `${y}px`);
  });
  container.addEventListener('mouseleave', (e) => {
    container.style.setProperty('--mouse-x', `-1000px`);
    container.style.setProperty('--mouse-y', `-1000px`);
  });

  // --- 7. "CLICK" EVENT - (Handles Place Node, Wall, and Delete) ---
  network.on("click", function(params) {
    if (isAnimating) return; 

    if (currentMode === 'placeNode') {
      if (params.nodes.length === 0 && params.edges.length === 0) {
        const clickPosition = params.pointer.canvas;
        try {
          nodes.add({
            id: nodeToPlace, label: nodeToPlace,
            x: clickPosition.x, y: clickPosition.y,
            color: { background: "#00aeff", border: "#0099cc" } // Brighter Blue
          });
          logicalGraph.addNode(nodeToPlace);
          
          const option1 = new Option(nodeToPlace, nodeToPlace);
          const option2 = new Option(nodeToPlace, nodeToPlace);
          startNodeSelect.add(option1);
          endNodeSelect.add(option2);
          
          updateStatus(`Node '${nodeToPlace}' added.`, false);
          
        } catch (err) {
          updateStatus("Error: Node already exists!", true);
        }
        currentMode = 'addNode';
        nodeToPlace = null;
        addNodeButton.classList.remove('active'); // Deactivate button
      }
    } 
    else if (currentMode === 'toggleWall') {
      if (params.nodes.length > 0) {
        const nodeName = params.nodes[0];
        const isNowWall = logicalGraph.toggleWall(nodeName);
        if (isNowWall) {
          // --- UPDATED ---
          nodes.update({ 
            id: nodeName, 
            color: { background: '#30363d', border: '#0d1117' },
            font: { color: '#e6edf3' } // Set font to light
          });
          updateStatus(`Node '${nodeName}' is now a Wall.`, false);
        } else {
          // --- UPDATED ---
          nodes.update({ 
            id: nodeName, 
            color: { background: "#00aeff", border: "#0099cc" },
            font: { color: '#e6edf3' } // Reset font to white
          });
          updateStatus(`Node '${nodeName}' is no longer a Wall.`, false);
        }
      }
    }
    else if (currentMode === 'deleteItem') {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        nodes.remove({ id: nodeId });
        logicalGraph.deleteNode(nodeId);
        
        startNodeSelect.querySelector(`option[value="${nodeId}"]`).remove();
        endNodeSelect.querySelector(`option[value="${nodeId}"]`).remove();
        updateStatus(`Node '${nodeId}' deleted.`, false);
      } 
      else if (params.edges.length > 0) {
        const edgeId = params.edges[0];
        const edgeData = edges.get(edgeId);
        edges.remove({ id: edgeId });
        logicalGraph.deleteEdge(edgeData.from, edgeData.to, { isBidirectional: true });
        updateStatus(`Edge deleted.`, false);
      }
    }
  });

  // --- 8. "DOUBLE-CLICK TO ADD EDGE" EVENT ---
  network.on("doubleClick", function(params) {
    if (isAnimating || currentMode !== 'addNode') return; 
    
    if (params.nodes.length > 0) {
      const nodeName = params.nodes[0];
      if (logicalGraph.walls.has(nodeName)) {
        updateStatus("Cannot create edge from a wall node.", true);
        return;
      }
      
      if (selectedNode === null) {
        selectedNode = nodeName;
        nodes.update({ id: nodeName, color: { background: "#ffdd00", border: "#cca700" } }); // Vibrant Yellow
        updateStatus(`Start node selected: ${nodeName}. Double-click end node.`, false);
      } else {
        if (logicalGraph.walls.has(nodeName)) {
          updateStatus("Cannot create edge to a wall node.", true);
          return;
        }
        if (selectedNode === nodeName) { // Don't allow self-loops
          nodes.update({ id: selectedNode, color: { background: "#00aeff", border: "#0099cc" } });
          selectedNode = null;
          updateStatus("Ready. Build your graph!", false);
          return;
        }

        let isBidirectional = true;
        for (const radio of edgeTypeRadios) {
          if (radio.checked && radio.value === 'di') {
            isBidirectional = false;
            break;
          }
        }

        if (isBidirectional) {
          edges.add({ from: selectedNode, to: nodeName, color: { color: "#8b949e" } }); 
        } else {
          edges.add({ from: selectedNode, to: nodeName, arrows: 'to', color: { color: "#8b949e" } }); 
        }
        
        logicalGraph.addEdge(selectedNode, nodeName, { isBidirectional: isBidirectional });
        updateStatus(`Edge added: ${selectedNode} to ${nodeName}.`, false);
        
        nodes.update({ id: selectedNode, color: { background: "#00aeff", border: "#0099cc" } }); 
        selectedNode = null;
      }
    } else {
      // Clicked on empty space
      if (selectedNode) {
        nodes.update({ id: selectedNode, color: { background: "#00aeff", border: "#0099cc" } });
        selectedNode = null;
        updateStatus("Edge creation cancelled.", false);
      }
    }
  });

  // --- 9. CONTROL PANEL BUTTONS ---
  
  // "Add Node" Button
  addNodeButton.addEventListener("click", function() {
    if (isAnimating) return;
    
    const nodeName = nodeNameInput.value.trim();
    if (nodeName === "") {
      updateStatus("Error: Node name cannot be empty!", true);
      return;
    }
    
    // Deactivate other modes
    wallButton.classList.remove('active');
    deleteButton.classList.remove('active');
    
    currentMode = 'placeNode';
    nodeToPlace = nodeName;
    nodeNameInput.value = ""; // Clear the input
    addNodeButton.classList.add('active'); // Make it active
    updateStatus(`Click on the grid to place node '${nodeName}'.`, false);
  });
  
  // "Run BFS" Button
  runButton.addEventListener("click", function() {
    algorithmMode = 'bfs';
    runAlgorithmAnimation(logicalGraph.bfs.bind(logicalGraph), 'BFS');
  });

  // "Run DFS" Button
  dfsButton.addEventListener("click", function() {
    algorithmMode = 'dfs';
    runAlgorithmAnimation(logicalGraph.dfs.bind(logicalGraph), 'DFS');
  });

  // "Toggle Wall" Button
  wallButton.addEventListener("click", function() {
    if (isAnimating) return;
    
    if (currentMode === 'toggleWall') {
      currentMode = 'addNode';
      wallButton.classList.remove('active');
      updateStatus("Ready. Build your graph!", false);
    } else {
      currentMode = 'toggleWall';
      wallButton.classList.add('active');
      deleteButton.classList.remove('active');
      updateStatus("WALL MODE: Click a node to toggle.", false);
    }
    
    // Reset any node selections
    if (selectedNode) {
      nodes.update({ id: selectedNode, color: { background: "#00aeff", border: "#0099cc" } });
      selectedNode = null;
    }
    nodeToPlace = null;
  });

  // "Delete Item" Button
  deleteButton.addEventListener("click", function() {
    if (isAnimating) return;
    
    if (currentMode === 'deleteItem') {
      currentMode = 'addNode';
      deleteButton.classList.remove('active');
      updateStatus("Ready. Build your graph!", false);
    } else {
      currentMode = 'deleteItem';
      deleteButton.classList.add('active');
      wallButton.classList.remove('active');
      updateStatus("DELETE MODE: Click a node or edge.", false);
    }

    // Reset any node selections
    if (selectedNode) {
      nodes.update({ id: selectedNode, color: { background: "#00aeff", border: "#0099cc" } });
      selectedNode = null;
    }
    nodeToPlace = null;
  });

  // "Clear All" Button
  clearAllButton.addEventListener("click", function() {
    if (isAnimating) return;
    
    // 1. Clear all VISUALS
    nodes.clear();
    edges.clear();
    
    // 2. Clear the "BRAIN"
    logicalGraph.adjacencyList.clear();
    logicalGraph.walls.clear();
    
    // 3. Clear all UI
    clearDataBoxes();
    clearMetrics();
    updateStatus("Graph cleared. Ready to build!", false);
    
    // 4. Reset Dropdowns (remove all options)
    for (let i = startNodeSelect.options.length - 1; i > 0; i--) {
      startNodeSelect.remove(i);
      endNodeSelect.remove(i);
    }
    
    // 5. Reset any active tools
    currentMode = 'addNode';
    selectedNode = null;
    nodeToPlace = null;
    wallButton.classList.remove('active');
    deleteButton.classList.remove('active');
    addNodeButton.classList.remove('active');
  });
  
  // --- 11. "LOAD SAMPLE" BUTTON ---
  sampleGraphButton.addEventListener('click', () => {
    if (isAnimating) return;
    
    clearAllButton.click(); // Clear the board first
    
    // We wait 100ms for the clear to finish
    setTimeout(() => {
      try {
        // 1. Define sample data
        const nodeData = [
          {id: '1', label: '1', x: -250, y: -100},
          {id: '2', label: '2', x: -100, y: 0},
          {id: '3', label: '3', x: -250, y: 100},
          {id: '4', label: '4', x: 50, y: -100},
          {id: '5', label: '5', x: 200, y: 0},
          {id: '6', label: '6', x: 50, y: 100},
          {id: '7', label: '7', x: -100, y: 200}
        ];
        const edgeData = [
          { from: '1', to: '2' }, { from: '1', to: '3' },
          { from: '2', to: '4' }, { from: '2', to: '5' },
          { from: '3', to: '6' }, { from: '3', to: '7' },
          { from: '4', to: '5' }, { from: '5', to: '7' },
          { from: '6', to: '7' }, { from: '7', to: '1' }
        ];

        // 3. Add Nodes to Graph
        nodeData.forEach(node => {
          nodes.add({ 
            id: node.id, label: node.label, x: node.x, y: node.y,
            color: { background: "#00aeff", border: "#0099cc" }
          });
          logicalGraph.addNode(node.id);
          startNodeSelect.add(new Option(node.label, node.id));
          endNodeSelect.add(new Option(node.label, node.id));
        });
        
        // 4. Add Edges to Graph
        edgeData.forEach(edge => {
          edges.add({ 
            from: edge.from, to: edge.to, 
            arrows: 'to', color: { color: "#8b949e" } 
          });
          logicalGraph.addEdge(edge.from, edge.to, { isBidirectional: false });
        });
        
        updateStatus("Sample graph loaded successfully!", false);
        
      } catch (err) {
        console.error(err);
        updateStatus("Error loading sample graph.", true);
      }
    }, 100); 
  });

  // --- 12. MESSAGE HELPER FUNCTION ---
  function updateStatus(message, isError = false) {
    statusMessage.textContent = message;
    if (isError) {
      statusMessage.style.color = '#f85149';
      statusMessage.closest('#results-panel').style.borderColor = '#f85149';
      statusMessage.closest('#results-panel').style.backgroundColor = '#490c0b';
    } else {
      statusMessage.style.color = '#a5d6ff';
      statusMessage.closest('#results-panel').style.borderColor = '#388bfd';
      statusMessage.closest('#results-panel').style.backgroundColor = '#0c2d6b';
    }
  }

  // --- 13. "MASTER" ANIMATION FUNCTION ---
  function runAlgorithmAnimation(algorithmFunction, algoName) {
    if (isAnimating) return;

    // 1. Get nodes and validate
    startNode = startNodeSelect.value;
    endNode = endNodeSelect.value;

    if (!startNode || !endNode) {
      updateStatus("Error: Must select a Start and End node!", true);
      return;
    }
    
    if (logicalGraph.walls.has(startNode) || logicalGraph.walls.has(endNode)) {
      updateStatus("Error: Start or End node cannot be a wall!", true);
      return;
    }

    // 2. Clear previous run
    isAnimating = true;
    clearDataBoxes();
    clearMetrics();
    resetGraphVisuals();
    updateStatus(`Running ${algoName}...`, false);

    // 3. Run "the brain"
    const startTime = performance.now();
    const { path, animation, metrics } = algorithmFunction(startNode, endNode);
    const endTime = performance.now();
    
    // 4. Start the animation
    const animationSpeed = 800; // 800ms per step
    let step = 0;

    function animate() {
      if (step >= animation.length) {
        // Animation is DONE
        isAnimating = false;
        
        const timeTaken = ((endTime - startTime) / 1000).toFixed(4);
        
        if (path) {
          highlightPath(path);
          const pathString = `Path found: ${path.join(' -> ')}`;
          updateStatus(pathString, false);
          statusHistory.push(pathString);
          updateMetrics(timeTaken, metrics.nodesVisited, metrics.pathLength);
        } else {
          updateStatus("No path found.", true);
          statusHistory.push("No path found.");
          updateMetrics(timeTaken, metrics.nodesVisited, 0);
        }
        
        return;
      }

      const currentStep = animation[step];

      // --- 4. PROCESS ONE ANIMATION STEP ---
      if (currentStep.type === 'visitNode') {
        const color = (currentStep.node === startNode) ? "#30ff30" : "#ffdd00"; // Green for start, Yellow for others
        const borderColor = (currentStep.node === startNode) ? "#21833c" : "#cca700";
        nodes.update({ id: currentStep.node, color: { background: color, border: borderColor } });
      } 
      else if (currentStep.type === 'visitEdge') {
        const edge = edges.get({ 
          filter: e => (e.from === currentStep.from && e.to === currentStep.to) || (e.from === currentStep.to && e.to === currentStep.from)
        })[0];
        if (edge) {
          edges.update({ id: edge.id, color: { color: "#ffdd00" }, width: 4 });
        }
      } 
      else if (currentStep.type === 'queueUpdate') {
        updateQueueVisual(currentStep.queue);
      } 
      else if (currentStep.type === 'stackUpdate') {
        updateStackVisual(currentStep.stack);
      }
      else if (currentStep.type === 'log') {
        updateLog(currentStep.msg, currentStep.isError);
      }
      else if (currentStep.type === 'pathNode') {
        // This is handled by highlightPath at the end now
      }

      step++;
      setTimeout(animate, animationSpeed);
    };
    
    // Start the animation
    if (!logicalGraph.walls.has(startNode)) {
        nodes.update({ id: startNode, color: { background: "#30ff30", border: "#21833c" } });
    }
    animate();
  }
  
  // --- 14. HELPER FUNCTIONS (VISUALS) ---
  
  function clearDataBoxes() {
    queueBox.innerHTML = "";
    stackBox.innerHTML = "";
    logBox.innerHTML = "";
    statusHistory = []; // Clear log history
  }
  function clearMetrics() {
    metricsBox.innerHTML = "";
  }
  
  // Your "Awesome" Horizontal Queue Function
  function updateQueueVisual(queueArray) {
    queueBox.innerHTML = ""; // Clear the box
    queueArray.forEach(nodeName => {
      const item = document.createElement("div");
      item.className = "queue-item";
      item.textContent = nodeName;
      queueBox.appendChild(item);
    });
  }

  // Your "Awesome" Vertical Stack Function
  function updateStackVisual(stackArray) {
    stackBox.innerHTML = ""; // Clear the box
    stackArray.slice().reverse().forEach(nodeName => { // We reverse a copy to display
      const item = document.createElement("div");
      item.className = "stack-item";
      item.textContent = nodeName;
      stackBox.appendChild(item);
    });
  }
  
  // Your "Awesome" Log Function
  function updateLog(message, isError = false) {
    const item = document.createElement("div");
    item.className = "log-item" + (isError ? " error" : "");
    item.textContent = `> ${message}`;
    logBox.appendChild(item);
    logBox.scrollTop = logBox.scrollHeight; // Auto-scroll
    
    // Store for download
    statusHistory.push(message);
  }
  
  // Your "Awesome" Metrics Function
  function updateMetrics(time, nodesVisited, pathLength) {
    metricsBox.innerHTML = `
      Time Taken: ${time} s<br>
      Nodes Visited: ${nodesVisited}<br>
      Path Length: ${pathLength}
    `;
  }

  // Resets all nodes and edges to default colors
  // Resets all nodes and edges to default colors
  function resetGraphVisuals() {
    // 1. Reset all nodes
    const allNodes = nodes.get();
    const nodeUpdates = allNodes.map(node => {
      if (logicalGraph.walls.has(node.id)) {
        return { 
          id: node.id, 
          color: { background: '#30363d', border: '#0d1117' },
          font: { color: '#e6edf3' }
        };
      } else {
        return { 
          id: node.id, 
          color: { background: "#00aeff", border: "#0099cc" },
          font: { color: '#e6edf3' } // <--- CHANGE THIS TO '#e6edf3' (White)
        };
      }
    });
    nodes.update(nodeUpdates);
    

    // 2. Reset all edges
    const allEdges = edges.get();
    const edgeUpdates = allEdges.map(edge => ({
      id: edge.id,
      color: { color: "#8b949e" },
      width: 3,
      shadow: { enabled: false }
    }));
    edges.update(edgeUpdates);
  }
  
  // Highlights the final path in green
  function highlightPath(path) {
    for (const node of path) {
      nodes.update({ 
        id: node, 
        color: { background: "#30ff30", border: "#21833c" },
        shadow: { enabled: true, color: '#30ff30', size: 25 }
      });
    }
    for (let i = 0; i < path.length - 1; i++) {
      const edge = edges.get({ 
        filter: e => (e.from === path[i] && e.to === path[i+1]) || (e.from === path[i+1] && e.to === path[i]) 
      })[0];
      if (edge) {
        edges.update({ 
          id: edge.id, 
          color: { color: "#30ff30" }, 
          width: 5,
          shadow: { enabled: true, color: '#30ff30', size: 20 }
        });
      }
    }
  }
  
  // --- 15. SPLASH & MODAL BUTTON LISTENERS ---

  // Splash screen "Continue"
  continueButton.addEventListener("click", function() {
    splashScreen.classList.add('hidden');
  });

  // "Developed By" button
  devButton.addEventListener("click", function() {
    devModal.style.display = "flex";
    setTimeout(() => { devModal.classList.add('visible'); }, 10);
  });
  devModalClose.addEventListener("click", function() {
    devModal.classList.remove('visible');
    setTimeout(() => { devModal.style.display = "none"; }, 200);
  });

  // "Learn" button
  learnButton.addEventListener("click", function() {
    learnModal.style.display = "flex";
    setTimeout(() => { learnModal.classList.add('visible'); }, 10);
  });
  learnModalClose.addEventListener("click", function() {
    learnModal.classList.remove('visible');
    setTimeout(() => { learnModal.style.display = "none"; }, 200);
  });

  // "Help" button
  helpButton.addEventListener("click", function() {
    helpModal.style.display = "flex";
    setTimeout(() => { helpModal.classList.add('visible'); }, 10);
  });
  helpModalClose.addEventListener("click", function() {
    helpModal.classList.remove('visible');
    setTimeout(() => { helpModal.style.display = "none"; }, 200);
  });
  
  // --- === THIS IS THE NEW, STYLED PDF FUNCTION === ---
  downloadButton.addEventListener('click', () => {
    updateStatus("Generating PDF...", false);
    
    // 1. Use html2canvas to take the screenshot
    html2canvas(document.getElementById('graph-canvas')).then(canvas => {
      
      // 2. Get the image data from the canvas
      const imageData = canvas.toDataURL('image/png');
      
      // 3. Initialize jsPDF.
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
  
      // --- Get all the data (same as before) ---
      const algoName = algorithmMode === 'bfs' ? 'Breadth-First Search (BFS)' : 'Depth-First Search (DFS)';
      const sNode = startNode || 'N/A';
      const eNode = endNode || 'N/A';
      const finalPath = statusHistory[statusHistory.length - 1] || 'No path found or algorithm not run.';
      const procedure = document.getElementById('log-box').innerText; // The full log
      const metricsText = document.getElementById('metrics-box').innerText; // The metrics block

      // --- NEW STYLED PDF LOGIC ---
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const usableWidth = pageWidth - (2 * margin);
      let y = margin; // This is our vertical cursor

      // 1. Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('BFS/DFS ALGORITHM REPORT', pageWidth / 2, y, { align: 'center' });
      y += 15; // Add vertical space

      // 2. Configuration Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CONFIGURATION', margin, y);
      y += 7; // Smaller space

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Algorithm: ${algoName}`, margin, y);
      y += 6;
      doc.text(`Start Node: ${sNode}`, margin, y);
      y += 6;
      doc.text(`End Node: ${eNode}`, margin, y);
      y += 12; // Section break

      // 3. Results Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RESULTS', margin, y);
      y += 7;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(finalPath, margin, y, { maxWidth: usableWidth }); // Wrap if path is long
      // Calculate how many lines the path took
      const pathLines = doc.splitTextToSize(finalPath, usableWidth).length;
      y += (pathLines * 6) + 6; // Add space for each line + a section break

      // 4. Metrics Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('METRICS', margin, y);
      y += 7;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      // metricsText is a multi-line string. doc.text() can handle it.
      doc.text(metricsText, margin, y);
      // We need to calculate how much space the metrics text took
      const metricsLines = doc.splitTextToSize(metricsText, usableWidth).length;
      y += (metricsLines * 6) + 6; // Add space for each line + a section break

      // 5. Procedure (Log) Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PROCEDURE (ALGORITHM LOG)', margin, y);
      y += 7;

      doc.setFontSize(10); // Use a slightly smaller font for the log
      doc.setFont('courier', 'normal'); // Use a monospaced font!
      doc.text(procedure || 'No algorithm run.', margin, y, {
        maxWidth: usableWidth // This will wrap the text
      });
      
      // 6. Add the image on Page 2
     doc.addPage();

// --- === ADD THESE 4 LINES === ---
let y2 = margin; // Reset vertical cursor for page 2
doc.setFontSize(18);
doc.setFont('helvetica', 'bold');
doc.text('GRAPH', pageWidth / 2, y2, { align: 'center' });
y2 += 15; // Add 15mm of space after the title

const imgProps = doc.getImageProperties(imageData);
const imgHeight = (imgProps.height * usableWidth) / imgProps.width;

// --- === MODIFY THIS LINE === ---
// Change the 'margin' for the y-position to 'y2'
doc.addImage(imageData, 'PNG', margin, y2, usableWidth, imgHeight); 

// 7. Save and trigger the download
doc.save('BFS-DFS_Report.pdf');
      // Reset status
      updateStatus(finalPath, false);
  
    }).catch(err => {
      console.error(err);
      updateStatus("Error generating PDF.", true);
    });
  });
  // --- END OF REPLACED FUNCTION ---
  
  
  // "Guided By" button logic has been REMOVED
  
  // Generic modal close (if you click the dark background)
  [devModal, learnModal, helpModal].forEach(modal => { // "guidedModal" REMOVED
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { // Only if you clicked the overlay itself
        modal.classList.remove('visible');
        setTimeout(() => { modal.style.display = "none"; }, 200);
      }
    });
  });

});