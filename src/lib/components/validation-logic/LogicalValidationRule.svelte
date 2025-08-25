<script lang="ts">
	import {
		logicalOperationSchema,
		LogicalOperatorType,
		OperationType
	} from './schemas/logical-operation-schema.js';
	import { Button } from '../ui/button/index.js';
	import Icon from '@iconify/svelte';
	import TreeNode from './TreeNode.svelte';
	import { toBackendOperator, toDisplayOperator } from './utils/operators.js';

	////////////////////////////////////////////////////////////////////////////////////////////////

	// 	now can you run a clean-up task on this validation code in that
	// 1) remove unnecessary code which are not used (functions, variables, comments)
	// 2) Comment brief before each function what it doing and what output will
	// 3) make a files structure like all state variables / declared variables are should on top below imports and then functions
	// 4) remove unnecessary console.log statements
	// 5) keep handleEdit function and make it more readable and understandable for editing the complete tree of logical operations
	// 6) make sure all the functions are working as expected and are not causing any errors
	// 7) make sure all the variables are used in the correct way and are not causing any errors
	// 8) make sure all the comments are clear and concise and are not causing any errors
	// 9) make sure all the imports are used in the correct way and are not causing any errors
	// 10) make sure all the exports are used in the correct way and are not causing any errors
	// 11) make sure all the types are used in the correct way and are not causing any errors
	// 12) make sure all the interfaces are used in the correct way and are not causing any errors
	// 13) make sure all the enums are used in the correct way and are not causing any errors
	// 14) make sure all the constants are used in the correct way and are not causing any errors
	// 15) make sure all the classes are used in the correct way and are not causing any errors
	// 16) make sure all the methods are used in the correct way and are not causing any errors
	// 17) make sure all the properties are used in the correct way and are not causing any errors
	// 18) make sure all the events are used in the correct way and are not causing any errors
	// 19) make sure all the hooks are used in the correct way and are not causing any errors
	// 20) in handleEdit function, make sure to update the treeRoot immutably and not mutate the original treeRoot this function is updating the composite and logical conditions so make a clean code for this
	// 21) make sure all the components are used in the correct way and are not causing any errors
	// 22) in handleSave all the creation is there and at last updation of question is there
	// 23) make sure all the code is working as expected and are not causing any errors

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
	// removed unused referenceFieldCode
	// Debug inspection removed for cleanliness

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

	// Operator mapping handled by utils/operators

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
			const operatorLabel = toDisplayOperator(operation.Operator || 'Equal');
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
			const operatorType = toBackendOperator(condition.operator);
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

	// handleSave: create operations from current tree and notify parent
	async function handleSave() {
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
			handleLogicalOperationsCreated({ detail: dispatchData });
		} catch (error) {
			console.error('Error creating logical validation workflow:', error);
			errors.general = (error as any).message;
		}
	}

	// handleEdit: update existing operations immutably based on differences in the tree
	async function handleEdit() {
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
					const operatorType = toBackendOperator(cur.condition.operator);
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
								cur.condition.name && cur.condition.name.trim().length > 0
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

		// Compute changes
		const changes = diffNodes(treeRoot, originalTreeRoot);

		// Apply updates
		try {
			for (const change of changes) {
				if (change.kind === 'logical') {
					await fetch(`/api/server/operations/logical-operation/${change.id}`, {
						method: 'PUT',
						body: JSON.stringify(change.payload),
						headers: { 'content-type': 'application/json' }
					});
				} else {
					await fetch(`/api/server/operations/composition-operation/${change.id}`, {
						method: 'PUT',
						body: JSON.stringify(change.payload),
						headers: { 'content-type': 'application/json' }
					});
				}
			}
		} catch (error) {
			console.error('Error updating logical/composite operations:', error);
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
			<!-- <div class="flex items-center gap-2">
				<Button type="button" variant="outline" onclick={() => addLogicalAt([])}>
					<Icon icon="mdi:plus" class="mr-2 h-4 w-4" /> Add Logical at Root
				</Button>
				<Button type="button" variant="outline" onclick={() => addGroupAt([])}>
					<Icon icon="mdi:plus" class="mr-2 h-4 w-4" /> Add Group at Root
				</Button>
				<Button type="button" variant="outline" onclick={() => toggleGroupOperator([])}>
					Toggle Root: {treeRoot.operator}
				</Button>
			</div> -->
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
