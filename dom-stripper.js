// Guided Navigation roles for read-aloud, adapted from
// @readium/guided-navigation (src/roles.ts), part of readium/ts-toolkit.
//
// Copyright (c) 2024 Readium Foundation. All rights reserved.
// Use of this source code is governed by the BSD-3-Clause license:
// https://github.com/readium/ts-toolkit/blob/develop/LICENSE
//
// Only the role classification and the skippable-role set are taken; the
// wider library (GND document generation, textrefs, utterance extraction) is
// not used — Foliate already walks blocks, segments sentences and tracks
// highlight ranges itself. Roles combine THREE signals, in order: the element
// tag name, the ARIA `role` attribute, and `epub:type`. That combination is
// the agreed list the DAISY accessibility tests point reading systems at, and
// it is what lets a footnote/pagebreak/noteref be recognised in real-world
// books where authors are inconsistent.

// --- tag-name -> role (every element gets one of these for free) ---
const elementTypeRoles = {
    abbr: 'abbreviation',
    acronym: 'abbreviation',
    article: 'article',
    aside: 'aside',
    audio: 'audio',
    blockquote: 'blockquote',
    caption: 'caption',
    figcaption: 'caption',
    td: 'cell',
    dd: 'definition',
    details: 'details',
    figure: 'figure',
    header: 'header',
    h1: 'heading1', h2: 'heading2', h3: 'heading3',
    h4: 'heading4', h5: 'heading5', h6: 'heading6',
    img: 'image',
    ul: 'list', ol: 'list', li: 'listItem',
    main: 'main',
    math: 'math',
    nav: 'navigation',
    p: 'paragraph',
    pre: 'preformatted',
    tr: 'row',
    section: 'section',
    hr: 'separator',
    summary: 'summary',
    table: 'table',
    dfn: 'term', dt: 'term',
    video: 'video',
    svg: 'image',
}

// --- ARIA role -> role ---
const ariaRoles = {
    'doc-abstract': 'abstract',
    'doc-acknowledgments': 'acknowledgments',
    'doc-afterword': 'afterword',
    'doc-appendix': 'appendix',
    article: 'article',
    'doc-backlink': 'backlink',
    'doc-biblioentry': 'listItem', // Deprecated in DPUB-ARIA 1.1
    'doc-bibliography': 'bibliography',
    'doc-biblioref': 'biblioref',
    blockquote: 'blockquote',
    caption: 'caption',
    cell: 'cell',
    'doc-chapter': 'chapter',
    'doc-colophon': 'colophon',
    columnheader: 'columnheader',
    complementary: 'complementary',
    'doc-conclusion': 'conclusion',
    'doc-cover': 'cover',
    'doc-credit': 'credit',
    'doc-credits': 'credits',
    'doc-dedication': 'dedication',
    definition: 'definition',
    'doc-endnote': 'footnote', // Deprecated in DPUB-ARIA 1.1
    'doc-endnotes': 'endnotes',
    'doc-epigraph': 'epigraph',
    'doc-epilogue': 'epilogue',
    'doc-errata': 'errata',
    'doc-example': 'example',
    figure: 'figure',
    'doc-footnote': 'footnote',
    'doc-foreword': 'foreword',
    'doc-glossary': 'glossary',
    'doc-glossref': 'glossref',
    img: 'image',
    image: 'image', // ARIA 1.3 synonym of img
    'doc-index': 'index',
    'doc-introduction': 'introduction',
    list: 'list',
    listitem: 'listItem',
    main: 'main',
    math: 'math',
    navigation: 'navigation',
    'doc-noteref': 'noteref',
    'doc-notice': 'notice',
    'doc-pagebreak': 'pagebreak',
    'doc-pagelist': 'pagelist',
    paragraph: 'paragraph',
    'doc-part': 'part',
    'doc-preface': 'preface',
    'doc-prologue': 'prologue',
    'doc-pullquote': 'pullquote',
    grid: 'table',
    gridcell: 'cell',
    presentation: 'presentation',
    none: 'presentation',
    'doc-qna': 'qna',
    qna: 'qna',
    region: 'region',
    row: 'row',
    rowheader: 'rowheader',
    separator: 'separator',
    'doc-subtitle': 'subtitle',
    table: 'table',
    term: 'term',
    'doc-tip': 'tip',
    'doc-toc': 'toc',
}

// --- epub:type -> role ---
const epubTypeRoles = {
    abstract: 'abstract',
    acknowledgments: 'acknowledgments',
    afterword: 'afterword',
    appendix: 'appendix',
    aside: 'aside',
    backlink: 'backlink',
    biblioentry: 'listItem', // Deprecated in DPUB-ARIA 1.1
    bibliography: 'bibliography',
    biblioref: 'biblioref',
    'table-cell': 'cell',
    chapter: 'chapter',
    colophon: 'colophon',
    conclusion: 'conclusion',
    cover: 'cover',
    credit: 'credit',
    credits: 'credits',
    dedication: 'dedication',
    glossdef: 'definition',
    endnote: 'footnote',
    endnotes: 'endnotes',
    rearnote: 'footnote', // Deprecated alias of endnote
    rearnotes: 'endnotes', // Deprecated alias of endnotes
    epigraph: 'epigraph',
    epilogue: 'epilogue',
    errata: 'errata',
    example: 'example',
    figure: 'figure',
    footnote: 'footnote',
    foreword: 'foreword',
    glossary: 'glossary',
    glossref: 'glossref',
    index: 'index',
    introduction: 'introduction',
    landmarks: 'landmarks',
    list: 'list',
    'list-item': 'listItem',
    loa: 'loa',
    loi: 'loi',
    lot: 'lot',
    lov: 'lov',
    noteref: 'noteref',
    notice: 'notice',
    pagebreak: 'pagebreak',
    'page-list': 'pagelist',
    pagelist: 'pagelist',
    part: 'part',
    preface: 'preface',
    prologue: 'prologue',
    pullquote: 'pullquote',
    qna: 'qna',
    'table-row': 'row',
    subtitle: 'subtitle',
    table: 'table',
    glossterm: 'term',
    tip: 'tip',
    toc: 'toc',
}

const headingRoles = ['heading1', 'heading2', 'heading3',
    'heading4', 'heading5', 'heading6']

// `data-type` (O'Reilly/Atlas, and common in the wild) is read in addition to
// `epub:type`/ARIA: those books carry no epub:type at all, only data-type, so
// without this a noteref marker and the whole footnote block get read aloud.
// Mapped to the same role names, so the skippable set is shared.
const dataTypeRoles = {
    noteref: 'noteref',
    footnote: 'footnote',
    footnotes: 'endnotes',
    pagebreak: 'pagebreak',
}

// ARIA presentational inheritance: only a presentational <table>'s own
// required owned elements without an explicit role inherit it.
const tableOwnedTags = new Set(['tr', 'td', 'th'])
const tableOwnedIntermediateTags = new Set(['tr', 'thead', 'tbody', 'tfoot'])

const isElementPresentational = el => {
    const role = el.getAttribute('role')
    if (!role) return false
    const vals = role.split(/\s+/).filter(Boolean)
    return vals.includes('presentation') || vals.includes('none')
}

const hasExplicitAriaRole = el =>
    (el.getAttribute('role') ?? '').trim() !== ''

const inheritsTablePresentation = (el, tagName) => {
    if (!tableOwnedTags.has(tagName) || hasExplicitAriaRole(el)) return false
    for (let p = el.parentElement; p; p = p.parentElement) {
        const tag = p.tagName.toLowerCase()
        if (tag !== 'table' && !tableOwnedIntermediateTags.has(tag)) return false
        if (isElementPresentational(p)) return true
        if (tag === 'table' || hasExplicitAriaRole(p)) return false
    }
    return false
}

const hasRole = (el, role) => {
    const attr = el.getAttribute('role')
    if (!attr) return false
    return attr.split(/\s+/).filter(Boolean).includes(role)
}

const isTableContainer = el => {
    const tag = el.tagName.toLowerCase()
    return tag === 'table' || hasRole(el, 'table') || hasRole(el, 'grid') ||
        hasRole(el, 'treegrid')
}

const isRowElement = el => {
    const tag = el.tagName.toLowerCase()
    return tag === 'tr' || hasRole(el, 'row')
}

// Unscoped <th> fallback: first row -> columnheader, else -> rowheader.
const isFirstRowOfTable = tr => {
    let container = null
    for (let p = tr.parentElement; p; p = p.parentElement) {
        if (isTableContainer(p)) { container = p; break }
    }
    if (!container) return false
    const walker = container.ownerDocument.createTreeWalker(
        container, NodeFilter.SHOW_ELEMENT, {
            acceptNode: n => isRowElement(n)
                ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
        })
    return walker.nextNode() === tr
}

// Roles from an explicit `role=`/`epub:type` attribute.
const computeAttrRoles = el => {
    const attrRoles = []
    let presentational = false

    const role = el.getAttribute('role')
    if (role) {
        for (const val of role.split(/\s+/).filter(Boolean)) {
            if (val === 'presentation' || val === 'none') presentational = true
            if (val === 'heading') {
                // The heading level comes from aria-level; it defaults to 2.
                let level = 2
                const ariaLevel = parseInt(el.getAttribute('aria-level') ?? '', 10)
                if (Number.isFinite(ariaLevel) && ariaLevel >= 1)
                    level = Math.min(ariaLevel, 6)
                attrRoles.push(headingRoles[level - 1])
            } else if (ariaRoles[val]) {
                attrRoles.push(ariaRoles[val])
            }
        }
    }

    // epub:type is only meaningful in namespace-aware XHTML; read the literal
    // qualified name (XHTML always uses the "epub" prefix), with a namespaced
    // fallback for documents that resolve the attribute differently.
    const epubType = el.getAttribute('epub:type')
        ?? el.getAttributeNS('http://www.idpf.org/2007/ops', 'type')
    if (epubType) {
        for (const val of epubType.split(/\s+/).filter(Boolean)) {
            const mapped = epubTypeRoles[val]
            if (mapped) attrRoles.push(mapped)
        }
    }

    // data-type: the O'Reilly/Atlas convention (see dataTypeRoles above)
    const dataType = el.getAttribute('data-type')
    if (dataType) {
        for (const val of dataType.split(/\s+/).filter(Boolean)) {
            const mapped = dataTypeRoles[val]
            if (mapped) attrRoles.push(mapped)
        }
    }

    return { attrRoles, presentational }
}

// The Guided Navigation roles of an element: tag name first, then the more
// specific `role=`/`epub:type` roles, matching the spec's ordering, e.g.
// `<section epub:type="chapter">` -> ['section', 'chapter']. A `presentation`
// / `none` ARIA role strips the element of its native semantics.
export const extractNodeRoles = el => {
    const roles = []
    const add = role => { if (!roles.includes(role)) roles.push(role) }

    const { attrRoles, presentational } = computeAttrRoles(el)
    const tagName = el.tagName.toLowerCase()

    if (presentational) return ['presentation']
    if (inheritsTablePresentation(el, tagName)) return ['presentation']

    if (tagName === 'body') {
        add('body')
    } else if (tagName === 'th') {
        switch (el.getAttribute('scope')) {
            case 'col': add('columnheader'); break
            case 'row': add('rowheader'); break
            default: {
                const tr = el.parentElement
                if (tr && isFirstRowOfTable(tr)) add('columnheader')
                else if (el.previousElementSibling === null) add('rowheader')
                else add('cell')
            }
        }
    } else {
        const mapped = elementTypeRoles[tagName]
        if (mapped) add(mapped)
    }

    for (const r of attrRoles) add(r)
    return roles
}

// Roles a reading system may leave out of read-aloud, per
// https://github.com/readium/guided-navigation/blob/main/roles.md. Examples:
// footnote/endnote asides, noteref superscripts, pagebreak labels, and
// navigational lists. They are secondary or navigational content a human
// reading aloud would not voice.
export const skippableRoles = new Set([
    // ancillary content
    'aside', 'bibliography', 'details', 'endnotes',
    'footnote', 'noteref', 'pullquote',
    // navigation
    'landmarks', 'loa', 'loi', 'lot', 'lov', 'pagebreak', 'toc',
])

export const isSkippable = el =>
    extractNodeRoles(el).some(role => skippableRoles.has(role))

// Whether a node is, or is inside, skippable content (walks the ancestor
// chain). Needed where a range/clone boundary unwraps the element itself, so
// isSkippable(el) cannot be checked on it directly.
export const isInSkippable = node => {
    const start = node?.nodeType === 1 ? node : node?.parentElement
    for (let el = start; el; el = el.parentElement)
        if (isSkippable(el)) return true
    return false
}

// A TreeWalker acceptNode for narration: reject skippable elements (pruning
// their whole subtree) and script/style, so footnotes, noteref markers and
// pagebreak labels never reach the synthesizer. Everything else is walked
// (elements skipped, their text accepted) exactly like the default filter.
export const narrationFilter = node => {
    if (node.nodeType !== 1) return NodeFilter.FILTER_ACCEPT
    const name = node.tagName.toLowerCase()
    if (name === 'script' || name === 'style') return NodeFilter.FILTER_REJECT
    return isSkippable(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP
}
