<script lang="ts">
	import {
		logicalOperationSchema,
		LogicalOperatorType,
		OperationType
	} from './logical-operation-schema.js';
	import { Button } from '../ui/button/index.js';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '../toast/toast.store.js';
	import TreeNode from './TreeNode.svelte';

	////////////////////////////////////////////////////////////////////////////////////////////////

	// 	now can you run a clean-up task on this validation code in that
	// 1) remove unnecessary code (functions, variables,comments)
	// 2) Comment brief before each function what it doing and what output will
	// 3) make a files structure like all state variables / declared variables are should on top below imports and then functions
	// 4) remove unnecessary console.log statements
	// 5) keep handleEdit function and make it more readable and understandable for editing the complete tree

	// Props
	let {
		isEditing = false,
		editingRule = null,
		currentField,
		ruleName = '',
		ruleDescription = '',
		questionList,
		conditions = [],
		shouldTriggerSave = $bindable(false),
		handleLogicalOperationsCreated,
		editedOperationId = null
	} = $props();

	// State
	let errors = $state({} as Record<string, string>);
	let isProcessing = $state(false);
	let referenceFieldCode = $state(currentField.Title || currentField.DisplayCode);
	$inspect(conditions, 'conditions');

	// Make conditions reactive with connector support
	let reactiveConditions = $state([...conditions]);

	// Store created logical operation IDs
	let createdLogicalOperationIds = $state([] as string[]);

	// -------------------------------
	// AST types and helpers
	// -------------------------------
	type FlatCondition = {
		field: string;
		operator: string;
		value?: string;
		name?: string;
		connector?: 'AND' | 'OR' | '' | null;
	};

	type LogicalNode = {
		type: 'logical';
		id?: string;
		condition: FlatCondition;
	};

	type CompositeNode = {
		type: 'composite';
		id?: string;
		operator: 'AND' | 'OR';
		children: Array<LogicalNode | CompositeNode>;
	};

	function mapDisplayOperatorToBackend(op: string): LogicalOperatorType {
		let operatorType = LogicalOperatorType.Equal;
		switch (op) {
			case 'Is Empty':
				operatorType = LogicalOperatorType.Exists; // Treat as existence check (server-side handles semantics)
				break;
			case 'Is Not Empty':
				operatorType = LogicalOperatorType.Exists;
				break;
			case 'Greater Than':
				operatorType = LogicalOperatorType.GreaterThan;
				break;
			case 'Less Than':
				operatorType = LogicalOperatorType.LessThan;
				break;
			case 'Equal To':
				operatorType = LogicalOperatorType.Equal;
				break;
			case 'Not Equal To':
				operatorType = LogicalOperatorType.NotEqual;
				break;
			case 'Contains':
				operatorType = LogicalOperatorType.Contains;
				break;
			case 'Does Not Contain':
				operatorType = LogicalOperatorType.DoesNotContain;
				break;
			case 'Greater Than or Equal':
				operatorType = LogicalOperatorType.GreaterThanOrEqual;
				break;
			case 'Less Than or Equal':
				operatorType = LogicalOperatorType.LessThanOrEqual;
				break;
			default:
				operatorType = LogicalOperatorType.Equal;
		}
		return operatorType;
	}

	// Map backend operator enum to UI display label
	function mapBackendOperatorToDisplay(op: string): string {
		switch (op) {
			case 'Equal':
				return 'Equal To';
			case 'NotEqual':
				return 'Not Equal To';
			case 'GreaterThan':
				return 'Greater Than';
			case 'LessThan':
				return 'Less Than';
			case 'GreaterThanOrEqual':
				return 'Greater Than or Equal';
			case 'LessThanOrEqual':
				return 'Less Than or Equal';
			case 'Contains':
				return 'Contains';
			case 'DoesNotContain':
				return 'Does Not Contain';
			case 'Exists':
				// Treat Exists as "Is Not Empty" in UI parlance
				return 'Is Not Empty';
			default:
				return op || 'Equal To';
		}
	}

	// Build an AST from flat conditions using AND precedence over OR
	function buildAstFromFlatConditions(flat: FlatCondition[]): LogicalNode | CompositeNode | null {
		if (!flat || flat.length === 0) return null;

		// Normalize connectors: first item has no connector; others must be 'AND' | 'OR'
		const normalized: FlatCondition[] = flat.map((c, idx) => ({
			...c,
			connector: idx === 0 ? null : c.connector === 'OR' ? 'OR' : 'AND'
		}));

		// First, group consecutive AND chains
		const groups: Array<LogicalNode | CompositeNode> = [];
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
				// finalize current chain
				if (currentAndChain.length === 1) {
					groups.push(currentAndChain[0]);
				} else {
					groups.push({ type: 'composite', operator: 'AND', children: [...currentAndChain] });
				}
				currentAndChain = [node];
			}
		}

		// push the last chain
		if (currentAndChain.length === 1) {
			groups.push(currentAndChain[0]);
		} else if (currentAndChain.length > 1) {
			groups.push({ type: 'composite', operator: 'AND', children: [...currentAndChain] });
		}

		// If only one group, return it; else OR them at root
		if (groups.length === 1) {
			return groups[0];
		}
		return { type: 'composite', operator: 'OR', children: groups };
	}

	// Tree state for nested UI (composite operators selected at group level)
	let treeRoot = $state<CompositeNode>({ type: 'composite', operator: 'AND', children: [] });
	let originalTreeRoot = $state<CompositeNode>({
		type: 'composite',
		operator: 'AND',
		children: []
	});
	let initializedFromEditing = $state(false);
	let initializedCreate = $state(false);
	let lastEditingRuleId = $state<string | null>(null);

	// Parse backend operation (Composition/Logical) recursively into our UI tree model
	function parseBackendOperationToTree(operation: any): CompositeNode | LogicalNode | null {
		if (!operation || !operation.Type) return null;
		const type = (operation.Type || '').toLowerCase();
		if (type === 'composition') {
			const op = (operation.Operator || 'And').toLowerCase() === 'or' ? 'OR' : 'AND';
			let rawChildren: any = operation.Children;
			if (typeof rawChildren === 'string') {
				try {
					rawChildren = JSON.parse(rawChildren);
				} catch {
					rawChildren = [];
				}
			}
			const children: Array<LogicalNode | CompositeNode> = [];
			if (Array.isArray(rawChildren)) {
				for (const child of rawChildren) {
					if (child && typeof child === 'object' && child.Type) {
						const parsed = parseBackendOperationToTree(child);
						if (parsed) children.push(parsed);
					}
				}
			}
			return { type: 'composite', id: operation.id, operator: op, children };
		}
		if (type === 'logical') {
			let field = '';
			let value: string | undefined = '';
			try {
				const operands = operation.Operands ? JSON.parse(operation.Operands) : [];
				if (Array.isArray(operands) && operands.length > 0) {
					const first = operands[0];
					if (first && (first.FieldId || first.fieldId)) {
						field = first.FieldId || first.fieldId;
					}
					if (operands[1] && operands[1].Value !== undefined) {
						value = operands[1].Value;
					}
				}
			} catch {}
			const operatorLabel = mapBackendOperatorToDisplay(operation.Operator || 'Equal');
			return {
				type: 'logical',
				id: operation.id,
				condition: {
					field,
					operator: operatorLabel,
					value,
					connector: null,
					name: operation.Name || ''
				}
			};
		}
		return null;
	}

	function createEmptyLogical(): LogicalNode {
		return {
			type: 'logical',
			condition: { field: '', operator: 'Equal To', value: '', connector: null, name: '' }
		};
	}
	function createEmptyComposite(): CompositeNode {
		return { type: 'composite', operator: 'AND', children: [] };
	}

	function getNodeByPath(path: number[]): CompositeNode | LogicalNode {
		let node: any = treeRoot;
		for (const idx of path) {
			node = node.children[idx];
		}
		return node;
	}

	function getCompositeAtPath(path: number[]): CompositeNode {
		if (path.length === 0) return treeRoot;
		const parentPath = path.slice(0, -1);
		return getNodeByPath(parentPath) as CompositeNode;
	}

	function addLogicalAt(pathToComposite: number[]) {
		const comp =
			pathToComposite.length === 0 ? treeRoot : (getNodeByPath(pathToComposite) as CompositeNode);
		comp.children = [...comp.children, createEmptyLogical()];
		treeRoot = { ...treeRoot };
	}

	function addGroupAt(pathToComposite: number[]) {
		const comp =
			pathToComposite.length === 0 ? treeRoot : (getNodeByPath(pathToComposite) as CompositeNode);
		comp.children = [...comp.children, createEmptyComposite()];
		treeRoot = { ...treeRoot };
	}

	function removeAt(path: number[]) {
		if (path.length === 0) return;
		const parent = getCompositeAtPath(path);
		const idx = path[path.length - 1];
		parent.children = parent.children.filter((_, i) => i !== idx);
		treeRoot = { ...treeRoot };
	}

	function toggleGroupOperator(pathToComposite: number[]) {
		const comp =
			pathToComposite.length === 0 ? treeRoot : (getNodeByPath(pathToComposite) as CompositeNode);
		comp.operator = comp.operator === 'AND' ? 'OR' : 'AND';
		treeRoot = { ...treeRoot };
	}

	// Handlers for child change events
	function onChangeGroupOperator(path: number[], op: 'AND' | 'OR') {
		const comp = path.length === 0 ? treeRoot : (getNodeByPath(path) as CompositeNode);
		if (path.length === 0) {
			// replace root immutably
			treeRoot = { ...treeRoot, operator: op };
			return;
		}
		const parent = getCompositeAtPath(path);
		const idx = path[path.length - 1];
		parent.children = parent.children.map((child, i) =>
			i === idx ? { ...(child as any), operator: op } : child
		);
		treeRoot = { ...treeRoot };
	}

	function onChangeLeafField(path: number[], fieldId: string) {
		const parent = getCompositeAtPath(path);
		const idx = path[path.length - 1];
		const child = parent.children[idx] as LogicalNode;
		if (!child || child.type !== 'logical') return;
		const updated: LogicalNode = { ...child, condition: { ...child.condition, field: fieldId } };
		parent.children = parent.children.map((c, i) => (i === idx ? updated : c));
		treeRoot = { ...treeRoot };
	}

	function onChangeLeafOperator(path: number[], operator: string) {
		const parent = getCompositeAtPath(path);
		const idx = path[path.length - 1];
		const child = parent.children[idx] as LogicalNode;
		if (!child || child.type !== 'logical') return;
		const nextValue =
			operator === 'Is Empty' || operator === 'Is Not Empty' ? '' : child.condition.value;
		const updated: LogicalNode = {
			...child,
			condition: { ...child.condition, operator: operator as any, value: nextValue }
		};
		parent.children = parent.children.map((c, i) => (i === idx ? updated : c));
		treeRoot = { ...treeRoot };
	}

	function onChangeLeafValue(path: number[], value: string) {
		const parent = getCompositeAtPath(path);
		const idx = path[path.length - 1];
		const child = parent.children[idx] as LogicalNode;
		if (!child || child.type !== 'logical') return;
		const updated: LogicalNode = { ...child, condition: { ...child.condition, value } };
		parent.children = parent.children.map((c, i) => (i === idx ? updated : c));
		treeRoot = { ...treeRoot };
	}

	function onChangeLeafName(path: number[], name: string) {
		const parent = getCompositeAtPath(path);
		const idx = path[path.length - 1];
		const child = parent.children[idx] as LogicalNode;
		if (!child || child.type !== 'logical') return;
		const updated: LogicalNode = { ...child, condition: { ...child.condition, name } };
		parent.children = parent.children.map((c, i) => (i === idx ? updated : c));
		treeRoot = { ...treeRoot };
	}

	type FlatItem =
		| { kind: 'composite'; node: CompositeNode; depth: number; path: number[] }
		| { kind: 'logical'; node: LogicalNode; depth: number; path: number[] };

	function flattenTree(
		node: CompositeNode | LogicalNode,
		depth = 0,
		path: number[] = []
	): FlatItem[] {
		if ((node as any).type === 'logical') {
			return [{ kind: 'logical', node: node as LogicalNode, depth, path }];
		}
		const comp = node as CompositeNode;
		let items: FlatItem[] = [{ kind: 'composite', node: comp, depth, path }];
		comp.children.forEach((child, idx) => {
			items = items.concat(flattenTree(child as any, depth + 1, [...path, idx]));
		});
		return items;
	}

	let flatItems = $derived(flattenTree(treeRoot));

	// Map to hold operator selected for new groups per path
	let newGroupOpByPath = $state({} as Record<string, 'AND' | 'OR'>);
	function pathKey(path: number[]) {
		return path.join('-');
	}

	function addGroupAtWithOperator(pathToComposite: number[], op: 'AND' | 'OR') {
		const comp =
			pathToComposite.length === 0 ? treeRoot : (getNodeByPath(pathToComposite) as CompositeNode);
		const grp: CompositeNode = { type: 'composite', operator: op, children: [] };
		comp.children = [...comp.children, grp];
		treeRoot = { ...treeRoot };
	}

	// Reset initialization flags when editing target changes
	$effect(() => {
		const id = editingRule?.originalRule?.id || editingRule?.id || null;
		if (id !== lastEditingRuleId) {
			lastEditingRuleId = id;
			initializedFromEditing = false;
			initializedCreate = false;
		}
	});

	// Initialize treeRoot from backend nested operation if available; fallback to flat conditions
	$effect(() => {
		if (isEditing && editingRule && !initializedFromEditing) {
			const op = editingRule.originalRule?.Operation;
			if (op) {
				const parsed = parseBackendOperationToTree(op);
				if (parsed) {
					if (parsed.type === 'composite') {
						treeRoot = parsed as CompositeNode;
					} else {
						treeRoot = { type: 'composite', operator: 'AND', children: [parsed as LogicalNode] };
					}
					originalTreeRoot = JSON.parse(JSON.stringify(treeRoot));
					initializedFromEditing = true;
					return;
				}
			}
			if (
				editingRule?.conditions &&
				Array.isArray(editingRule.conditions) &&
				editingRule.conditions.length > 0
			) {
				const ast = buildAstFromFlatConditions(editingRule.conditions as FlatCondition[]);
				if (ast) {
					if ((ast as any).type === 'composite') {
						treeRoot = ast as CompositeNode;
					} else {
						treeRoot = { type: 'composite', operator: 'AND', children: [ast as LogicalNode] };
					}
					originalTreeRoot = JSON.parse(JSON.stringify(treeRoot));
				}
			}
			initializedFromEditing = true;
		} else if (!isEditing && !initializedCreate) {
			treeRoot = { type: 'composite', operator: 'AND', children: [createEmptyLogical()] };
			initializedCreate = true;
		}
	});

	// Collapsed state per node path for better UX
	let collapsedByPath = $state({} as Record<string, boolean>);
	function toggleCollapse(path: number[]) {
		const key = pathKey(path);
		collapsedByPath[key] = !collapsedByPath[key];
		collapsedByPath = { ...collapsedByPath };
	}

	// Create operations bottom-up, returns created operation id for the node
	async function createOperationsForNode(node: LogicalNode | CompositeNode): Promise<string> {
		if (node.type === 'logical') {
			const condition = node.condition;
			// Find selected field
			const selectedField = getAllFields().find(
				(field) =>
					field.id === condition.field ||
					field.Title === condition.field ||
					field.DisplayCode === condition.field
			);
			if (!selectedField) {
				throw new Error('Selected field not found');
			}
			const operatorType = mapDisplayOperatorToBackend(condition.operator);
			let operands: any[] = [];
			if (condition.operator === 'Is Empty' || condition.operator === 'Is Not Empty') {
				operands = [
					{
						Type: 'FieldReference',
						DataType: selectedField?.ResponseType || 'Text',
						FieldId: selectedField?.id || '',
						FieldCode: selectedField?.DisplayCode || ''
					}
				];
			} else {
				operands = [
					{
						Type: 'FieldReference',
						DataType: selectedField?.ResponseType || 'Text',
						FieldId: selectedField?.id || '',
						FieldCode: selectedField?.DisplayCode || ''
					},
					{
						Type: 'Constant',
						DataType: 'Text',
						Value: condition.value || ''
					}
				];
			}

			const logicalOperation = {
				Name:
					(condition as any).name && `${(condition as any).name}`.trim().length > 0
						? `${(condition as any).name}`
						: `${ruleName} - Logical condition`,
				Description: `${ruleDescription} - Logical validation condition`,
				Type: OperationType.Logical,
				Operator: operatorType,
				Operands: JSON.stringify(operands)
			};

			const result = await logicalOperationSchema.safeParseAsync(logicalOperation);
			if (!result.success) {
				throw new Error('Invalid logical operation structure');
			}

			const logicalResponse = await fetch('/api/server/operations/logical-operation', {
				method: 'POST',
				body: JSON.stringify(logicalOperation),
				headers: { 'content-type': 'application/json' }
			});
			if (!logicalResponse.ok) {
				const errorData = await logicalResponse.json();
				toastMessage(errorData);
				throw new Error(errorData.Message || 'Failed to create logical operation');
			}
			const logicalData = await logicalResponse.json();
			const opId = logicalData.Data.id as string;
			createdLogicalOperationIds = [...createdLogicalOperationIds, opId];
			return opId;
		}

		// composite node
		const childIds: string[] = [];
		for (const child of node.children) {
			const id = await createOperationsForNode(child);
			childIds.push(id);
		}
		const compositeOperation = {
			Name: `${ruleName} - Composite validation`,
			Description: `${ruleDescription} - Composite logical validation`,
			Type: OperationType.Composition,
			Operator: node.operator === 'AND' ? 'And' : 'Or',
			Children: JSON.stringify(childIds)
		};
		const compositeResponse = await fetch('/api/server/operations/composition-operation', {
			method: 'POST',
			body: JSON.stringify(compositeOperation),
			headers: { 'content-type': 'application/json' }
		});
		if (!compositeResponse.ok) {
			const errorData = await compositeResponse.json();
			toastMessage(errorData);
			throw new Error(errorData.Message || 'Failed to create composite operation');
		}
		const compositeData = await compositeResponse.json();
		return compositeData.Data.id as string;
	}

	// Helper function to get all available fields from questionList
	function getAllFields() {
		const allFields = [];
		for (const section of questionList) {
			for (const field of section.FormFields) {
				allFields.push(field);
			}
		}
		return allFields;
	}

	function getFieldByAny(value: string) {
		if (!value) return null;
		return (
			getAllFields().find((f) => f.id === value || f.Title === value || f.DisplayCode === value) ||
			null
		);
	}

	function getFieldDisplay(value: string): string {
		const f = getFieldByAny(value);
		if (!f) return value || '';
		const label = f.Title || f.DisplayCode || '';
		return formatFieldTitle(label);
	}

	// Helper function to format field title with hyphens
	function formatFieldTitle(title: string): string {
		if (!title) return '';
		// Replace spaces and special characters with hyphens, but keep question marks and other punctuation
		return title
			.replace(/\s+/g, '-') // Replace spaces with hyphens
			.replace(/[^\w\-?.,!@#$%^&*()]/g, '-') // Replace special chars except punctuation with hyphens
			.replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
			.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
	}

	// Initialize treeRoot from backend nested operation if available; fallback to flat conditions (read-only display when editing)
	$effect(() => {
		if (isEditing && editingRule && !initializedFromEditing) {
			const op = editingRule.originalRule?.Operation;
			if (op) {
				const parsed = parseBackendOperationToTree(op);
				if (parsed) {
					if (parsed.type === 'composite') {
						treeRoot = parsed as CompositeNode;
					} else {
						treeRoot = { type: 'composite', operator: 'AND', children: [parsed as LogicalNode] };
					}
					originalTreeRoot = JSON.parse(JSON.stringify(treeRoot));
					initializedFromEditing = true;
					return;
				}
			}
			if (
				editingRule?.conditions &&
				Array.isArray(editingRule.conditions) &&
				editingRule.conditions.length > 0
			) {
				const ast = buildAstFromFlatConditions(editingRule.conditions as FlatCondition[]);
				if (ast) {
					if ((ast as any).type === 'composite') {
						treeRoot = ast as CompositeNode;
					} else {
						treeRoot = { type: 'composite', operator: 'AND', children: [ast as LogicalNode] };
					}
					originalTreeRoot = JSON.parse(JSON.stringify(treeRoot));
				}
			}
			initializedFromEditing = true;
		} else if (!isEditing && !initializedCreate) {
			treeRoot = { type: 'composite', operator: 'AND', children: [createEmptyLogical()] };
			initializedCreate = true;
		}
	});

	// Watch for save trigger from parent
	$effect(() => {
		if (shouldTriggerSave && !isProcessing) {
			isProcessing = true;
			(async () => {
				try {
					if (isEditing) {
						await handleEdit();
					} else {
						await handleSave();
					}
				} catch (error) {
					console.error('Error in save/edit operation:', error);
				} finally {
					isProcessing = false;
					shouldTriggerSave = false;
				}
			})();
		}
	});

	// Logical operators
	const operators = [
		'Is Empty',
		'Is Not Empty',
		'Greater Than',
		'Less Than',
		'Equal To',
		'Not Equal To',
		'Contains',
		'Does Not Contain',
		'Greater Than or Equal',
		'Less Than or Equal'
	];

	function addCondition() {
		reactiveConditions = [
			...reactiveConditions,
			{
				field: '',
				operator: '',
				value: '',
				connector: 'AND' // Default connector for additional conditions
			}
		];
	}

	function removeCondition(index: number) {
		reactiveConditions = reactiveConditions.filter((_, i) => i !== index);
	}

	function updateCondition(index: number, field: string, value: string) {
		reactiveConditions[index] = { ...reactiveConditions[index], [field]: value };
		reactiveConditions = [...reactiveConditions];
	}

	async function handleSave() {
		console.log('handleSave called with treeRoot:', treeRoot);
		// Reset errors
		errors = {} as Record<string, string>;

		// Helper: does operator require a value?
		function operatorRequiresValue(op: string): boolean {
			return op !== 'Is Empty' && op !== 'Is Not Empty';
		}

		// Prune incomplete logical leaves and empty groups
		function pruneTree(node: LogicalNode | CompositeNode): LogicalNode | CompositeNode | null {
			if (node.type === 'logical') {
				const c = node.condition;
				const hasField = !!c.field;
				const hasOperator = !!c.operator;
				const hasValue =
					!operatorRequiresValue(c.operator) ||
					(c.value !== undefined && c.value !== null && `${c.value}`.trim() !== '');
				return hasField && hasOperator && hasValue ? node : null;
			}
			// composite
			const prunedChildren: Array<LogicalNode | CompositeNode> = [];
			for (const child of node.children) {
				const pruned = pruneTree(child);
				if (pruned) prunedChildren.push(pruned);
			}
			if (prunedChildren.length === 0) return null;
			return { ...node, children: prunedChildren } as CompositeNode;
		}

		// Validate pruned tree
		const prunedRoot = pruneTree(treeRoot);
		if (!prunedRoot) {
			errors.general = 'Please add at least one complete condition.';
			console.log('Validation errors:', errors);
			return;
		}

		try {
			createdLogicalOperationIds = [];
			// Create operations bottom-up directly from pruned tree
			const rootOpId = await createOperationsForNode(prunedRoot);

			// Determine correct operation type for the created root
			const isCompositeRoot = (prunedRoot as any).type === 'composite';
			const dispatchData = {
				operationId: rootOpId,
				operationType: isCompositeRoot ? 'Composition' : 'Logical',
				operation: { id: rootOpId },
				logicalOperationIds: createdLogicalOperationIds
			};
			console.log('Dispatching to parent:', dispatchData);
			handleLogicalOperationsCreated({ detail: dispatchData });
		} catch (error) {
			console.error('Error creating logical validation workflow:', error);
			errors.general = error.message;
		}
	}

	async function handleEdit() {
		console.log('handleEdit called');
		// Reset errors
		errors = {} as Record<string, string>;

		// Helper to deep-compare nodes by id and properties
		function diffNodes(
			current: LogicalNode | CompositeNode,
			original: LogicalNode | CompositeNode
		) {
			const changes: Array<
				| { kind: 'logical'; id: string; payload: any }
				| { kind: 'composite'; id: string; payload: any }
			> = [];

			if (current.type !== original.type) return changes;

			if (current.type === 'logical' && original.type === 'logical') {
				const cur = current as LogicalNode;
				const orig = original as LogicalNode;
				if (!cur.id) return changes; // cannot PUT without id
				// detect field/operator/value/name changes
				const hasFieldChanged = cur.condition.field !== orig.condition.field;
				const hasOpChanged = cur.condition.operator !== orig.condition.operator;
				const hasValChanged = (cur.condition.value || '') !== (orig.condition.value || '');
				const hasNameChanged = (cur.condition.name || '') !== (orig.condition.name || '');
				if (hasFieldChanged || hasOpChanged || hasValChanged || hasNameChanged) {
					// Build new operands for PUT
					const selectedField = getAllFields().find(
						(f) =>
							f.id === cur.condition.field ||
							f.Title === cur.condition.field ||
							f.DisplayCode === cur.condition.field
					);
					const operatorType = mapDisplayOperatorToBackend(cur.condition.operator);
					let operands: any[] = [];
					if (cur.condition.operator === 'Is Empty' || cur.condition.operator === 'Is Not Empty') {
						operands = [
							{
								Type: 'FieldReference',
								DataType: selectedField?.ResponseType || 'Text',
								FieldId: selectedField?.id || '',
								FieldCode: selectedField?.DisplayCode || ''
							}
						];
					} else {
						operands = [
							{
								Type: 'FieldReference',
								DataType: selectedField?.ResponseType || 'Text',
								FieldId: selectedField?.id || '',
								FieldCode: selectedField?.DisplayCode || ''
							},
							{ Type: 'Constant', DataType: 'Text', Value: cur.condition.value || '' }
						];
					}
					changes.push({
						kind: 'logical',
						id: cur.id,
						payload: {
							Operator: operatorType,
							Operands: JSON.stringify(operands),
							Name:
								(cur.condition.name && cur.condition.name.trim().length > 0)
									? cur.condition.name.trim()
									: `${ruleName} - Logical condition`,
							Description: `${ruleDescription || ruleName || 'Validation'} - Logical validation condition`
						}
					});
				}
				return changes;
			}

			if (current.type === 'composite' && original.type === 'composite') {
				const cur = current as CompositeNode;
				const orig = original as CompositeNode;
				if (!cur.id) return changes;
				const hasOpChanged = cur.operator !== orig.operator;
				// Children updates are handled via their own ids; server model typically keeps Children as ids
				if (hasOpChanged) {
					changes.push({
						kind: 'composite',
						id: cur.id,
						payload: {
							Operator: cur.operator === 'AND' ? 'And' : 'Or',
							Name: `${ruleName} - Composite validation`,
							Description: `${ruleDescription || ruleName || 'Validation'} - Composite logical validation`
						}
					});
				}
				// Diff children by index assuming stable structure; recurse
				const len = Math.min(cur.children.length, orig.children.length);
				for (let i = 0; i < len; i++) {
					changes.push(...diffNodes(cur.children[i] as any, orig.children[i] as any));
				}
				return changes;
			}

			return changes;
		}

		// Ensure an operation exists for a node; create if missing and return id
		const ensureOperationForNode = async (node: LogicalNode | CompositeNode): Promise<string> => {
			if ((node as any).id) return (node as any).id as string;
			return await createOperationsForNode(node);
		};

		// Recursively sync composite children order and insert new nodes at the same position
		const syncCompositeChildren = async (
			curr: CompositeNode | LogicalNode,
			orig: CompositeNode | LogicalNode | null,
			path: number[] = []
		) => {
			if ((curr as any).type === 'logical') {
				// logical handled by diffNodes PUT above
				return;
			}
			const currComp = curr as CompositeNode;
			const origComp = (orig && (orig as any).type === 'composite') ? (orig as CompositeNode) : null;

			// Ensure each child has an operation id (create if missing)
			const newChildIds: string[] = [];
			for (const child of currComp.children) {
				const childId = await ensureOperationForNode(child as any);
				newChildIds.push(childId);
			}

			// Compare with original ids at the same path
			const origIds = origComp ? (origComp.children || []).map((c: any) => c?.id).filter(Boolean) : [];
			const childrenChanged =
				newChildIds.length !== origIds.length || newChildIds.some((id, i) => id !== origIds[i]);
			const operatorChanged = !origComp || currComp.operator !== origComp.operator;

			// Update this composite if needed
			if (currComp.id && (childrenChanged || operatorChanged)) {
				const payload: any = {};
				if (operatorChanged) payload.Operator = currComp.operator === 'AND' ? 'And' : 'Or';
				if (childrenChanged) payload.Children = JSON.stringify(newChildIds);
				payload.Name = `${ruleName} - Composite validation`;
				payload.Description = `${ruleDescription || ruleName || 'Validation'} - Composite logical validation`;
				await fetch(`/api/server/operations/composition-operation/${currComp.id}`, {
					method: 'PUT',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(payload)
				});
			}

			// Recurse into composite children
			for (let i = 0; i < currComp.children.length; i++) {
				const child = currComp.children[i] as any;
				const origChild = origComp && origComp.children ? (origComp.children[i] as any) : null;
				if (child && child.type === 'composite') {
					await syncCompositeChildren(child, origChild, [...path, i]);
				}
			}
		};

		try {
			const changes = diffNodes(treeRoot, originalTreeRoot);
			for (const change of changes) {
				if (change.kind === 'logical') {
					await fetch(`/api/server/operations/logical-operation/${change.id}`, {
						method: 'PUT',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({ ...change.payload })
					});
				} else if (change.kind === 'composite') {
					await fetch(`/api/server/operations/composition-operation/${change.id}`, {
						method: 'PUT',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({ ...change.payload })
					});
				}
			}
			// After updating existing nodes, ensure any new nodes are created and linked at correct positions
			await syncCompositeChildren(treeRoot, originalTreeRoot, []);
			// Optionally notify parent success
			toastMessage({ Message: 'Validation conditions updated', HttpCode: 200 });
			// ask parent to close modal (align with regex edit flow)
			handleLogicalOperationsCreated?.({ detail: { isEdit: true } });
		} catch (error) {
			console.error('Error updating logical/composite operations:', error);
			errors.general = (error as Error).message;
		}
	}
</script>

<!-- Logical Validation UI -->
<div class="space-y-6">
	<div class="mb-2 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
		<div class="mb-3 flex items-center justify-between">
			<div>
				<h3 class="text-lg font-semibold text-gray-800">Condition Tree</h3>
				<p class="text-sm text-gray-600">Compose nested groups (AND/OR) and logical leaves</p>
			</div>
			<div class="flex items-center gap-2">
				<Button type="button" variant="outline" onclick={() => addLogicalAt([])}>
					<Icon icon="mdi:plus" class="mr-2 h-4 w-4" /> Add Logical at Root
				</Button>
				<Button type="button" variant="outline" onclick={() => addGroupAt([])}>
					<Icon icon="mdi:plus" class="mr-2 h-4 w-4" /> Add Group at Root
				</Button>
				<Button type="button" variant="outline" onclick={() => toggleGroupOperator([])}>
					Toggle Root: {treeRoot.operator}
				</Button>
			</div>
		</div>

		<!-- Tree visual (interactive) -->
		<div class="space-y-2">
			<TreeNode
				node={treeRoot}
				path={[]}
				fields={getAllFields()}
				{operators}
				onAddLogical={(p) => addLogicalAt(p)}
				onAddGroup={(p, op) => addGroupAtWithOperator(p, op)}
				onRemove={(p) => removeAt(p)}
				onChangeGroupOperator={(p, op) => onChangeGroupOperator(p, op)}
				onChangeLeafField={(p, v) => onChangeLeafField(p, v)}
				onChangeLeafOperator={(p, v) => onChangeLeafOperator(p, v)}
				onChangeLeafValue={(p, v) => onChangeLeafValue(p, v)}
				onChangeLeafName={(p, v) => onChangeLeafName(p, v)}
				{collapsedByPath}
				onToggleCollapse={(p) => toggleCollapse(p)}
				readonly={false}
			/>
		</div>
	</div>

	<!-- Error Display -->
	{#if errors.general}
		<div class="rounded-md border border-red-200 bg-red-50 p-3">
			<p class="text-sm text-red-600">{errors.general}</p>
		</div>
	{/if}
</div>
