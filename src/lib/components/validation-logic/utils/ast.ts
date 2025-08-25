// AST helpers for logical/composite trees

export type FlatCondition = {
    field: string;
    operator: string;
    value?: string;
    name?: string;
    connector?: 'AND' | 'OR' | '' | null;
};

export type LogicalNode = {
    type: 'logical';
    id?: string;
    condition: FlatCondition;
};

export type CompositeNode = {
    type: 'composite';
    id?: string;
    operator: 'AND' | 'OR';
    children: Array<LogicalNode | CompositeNode>;
};

export type AnyNode = LogicalNode | CompositeNode;

export function buildAstFromFlatConditions(flat: FlatCondition[]): AnyNode | null {
    if (!flat || flat.length === 0) return null;

    const normalized: FlatCondition[] = flat.map((c, idx) => ({
        ...c,
        connector: idx === 0 ? null : c.connector === 'OR' ? 'OR' : 'AND'
    }));

    const groups: Array<AnyNode> = [];
    let currentAndChain: LogicalNode[] = [];

    for (let i = 0; i < normalized.length; i++) {
        const cond = normalized[i];
        const node: LogicalNode = { type: 'logical', condition: cond };
        if (i === 0) {
            currentAndChain.push(node);
            continue;
        }
        if (cond.connector === 'AND') {
            currentAndChain.push(node);
        } else if (cond.connector === 'OR') {
            if (currentAndChain.length === 1) {
                groups.push(currentAndChain[0]);
            } else {
                groups.push({ type: 'composite', operator: 'AND', children: [...currentAndChain] });
            }
            currentAndChain = [node];
        }
    }

    if (currentAndChain.length === 1) {
        groups.push(currentAndChain[0]);
    } else if (currentAndChain.length > 1) {
        groups.push({ type: 'composite', operator: 'AND', children: [...currentAndChain] });
    }

    if (groups.length === 1) return groups[0];
    return { type: 'composite', operator: 'OR', children: groups };
}

export function traverse(node: AnyNode | null, visit: (n: AnyNode, path: number[]) => void): void {
    if (!node) return;
    const stack: Array<{ n: AnyNode; path: number[] }> = [{ n: node, path: [] }];
    while (stack.length) {
        const { n, path } = stack.pop()!;
        visit(n, path);
        if (n.type === 'composite') {
            for (let i = n.children.length - 1; i >= 0; i--) {
                stack.push({ n: n.children[i] as AnyNode, path: [...path, i] });
            }
        }
    }
}

export function updateAtPath(root: AnyNode | null, path: number[], updater: (n: AnyNode) => AnyNode): AnyNode | null {
    if (!root) return null;
    if (path.length === 0) return updater(root);
    const clone = structuredClone(root) as AnyNode;
    let cursor: AnyNode = clone;
    for (let i = 0; i < path.length - 1; i++) {
        const idx = path[i];
        if (cursor.type !== 'composite') return clone;
        cursor.children[idx] = structuredClone(cursor.children[idx]) as AnyNode;
        cursor = cursor.children[idx] as AnyNode;
    }
    const last = path[path.length - 1];
    if ((cursor as CompositeNode).type === 'composite') {
        (cursor as CompositeNode).children[last] = updater((cursor as CompositeNode).children[last] as AnyNode);
    }
    return clone;
}


