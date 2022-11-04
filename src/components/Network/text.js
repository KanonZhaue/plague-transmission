var tmp_nodes = root.descendants(), tmp_links = root.links()
for (let k in tmp_links) {
    console.log(tmp_links[k].source.index)
    // tmp_links[k].source = tmp_links[k].source.index
    // tmp_links[k].target = tmp_links[k].target.index
}
console.log(tmp_links, tmp_nodes)

var force = d3.forceSimulation()
    .velocityDecay(0.8)
    .alphaDecay(0)
    .force("charge", d3.forceManyBody())
    .force("x", d3.forceX(viewbox.width / 2))
    .force("y", d3.forceY(viewbox.height / 2))

force.nodes(tmp_nodes)
force.force("link", d3.forceLink(tmp_links).strength(3).distance(200));

console.log(tmp_links, tmp_nodes)

// g.links.selectAll("line")
//     .data(tmp_links)
//     .enter()
//     .insert("line")
//     .style("storke", "#999")
//     .style("stroke-width", "1px")

g.nodes.selectAll("circle.node")
    .data(tmp_nodes)
    .enter()
    .append("circle")
    .attr("r", node_r)
    .style("fill", d => d.data.id == 0 ? '#000' : d.data.role.state[d.data.role.state[341].infected].scene.color)
    .style("stroke", "#000")
    .call(d3.drag()
        .on("start", dragStarted)
        // .on("drag", dragged)
        .on("end", dragEnded));

// force.on("tick", (e) => {
//     g.links.attr("x1", (d) => {
//         console.log(d)
//     })
//         .attr("y1", (d) => d.source.y)
//         .attr("x2", (d) => d.target.x)
//         .attr("y2", (d) => d.target.y)

//     g.nodes.attr("cx", (d) => d.x)
//         .attr("cy", (d) => d.y)

// })

function dragStarted(d) {
    d.fx = d.x;
    d.fy = d.y
}
// function dragged(d) {
//     d.fx = d3.event.x;
//     d.fy = d3.event.y;
// }
function dragEnded(d) {
    d.fx = null
    d.fy = null
}
