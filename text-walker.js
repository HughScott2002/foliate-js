const walkRange = (range, walker) => {
    const nodes = []
    for (let node = walker.currentNode; node; node = walker.nextNode()) {
        if (node.nodeType !== 3 && node.nodeType !== 4) continue
        if (range.comparePoint(node, 0) > 0) break
        if (range.comparePoint(node, node.length) >= 0) nodes.push(node)
    }
    return nodes
}

const walkDocument = (_, walker) => {
    const nodes = []
    for (let node = walker.nextNode(); node; node = walker.nextNode())
        nodes.push(node)
    return nodes
}

const filter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    | NodeFilter.SHOW_CDATA_SECTION

const acceptNode = node => {
    if (node.nodeType === 1) {
        const name = node.tagName.toLowerCase()
        if (name === 'script' || name === 'style') return NodeFilter.FILTER_REJECT
        return NodeFilter.FILTER_SKIP
    }
    return NodeFilter.FILTER_ACCEPT
}

export const textWalker = function* (x, func, filterFunc) {
    const root = x.commonAncestorContainer ?? x.body ?? x
    const walker = document.createTreeWalker(root, filter, { acceptNode: filterFunc || acceptNode })
    const walk = x.commonAncestorContainer ? walkRange : walkDocument
    const nodes = walk(x, walker)
    // A range may begin or end inside a text node. Segment only its selected
    // portion, then add the original offset back when creating DOM ranges.
    const starts = nodes.map(node => x.startContainer === node ? x.startOffset : 0)
    const strs = nodes.map((node, i) => node.nodeValue?.slice(starts[i],
        x.endContainer === node ? x.endOffset : undefined) ?? '')
    const makeRange = (startIndex, startOffset, endIndex, endOffset) => {
        const range = document.createRange()
        range.setStart(nodes[startIndex], startOffset + starts[startIndex])
        range.setEnd(nodes[endIndex], endOffset + starts[endIndex])
        return range
    }
    for (const match of func(strs, makeRange)) yield match
}
