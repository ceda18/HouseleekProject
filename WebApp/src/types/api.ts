// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: number
  name: string
  role: string
}

export interface RegisterRequest {
  name: string
  surname: string
  email: string
  password: string
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserDto {
  userId: number
  name: string
  email: string
  password?: string
  role?: string
}

// ─── Lookup / Catalog ────────────────────────────────────────────────────────

export interface LookupItem {
  id: number
  name: string
}

export interface VendorDto {
  userId: number       // PK from AbstractUser (= vendorId in item models)
  name: string
  pseudonym: string
}

export interface ActionDefinitionDto {
  actionDefinitionId: number
  name: string
  controllable: boolean
  valueType: string
  defaultValue?: string
  minValue?: string
  maxValue?: string
}

export interface ItemPropertyDto {
  itemPropertyId: number
  name: string
  value?: string | null
}

export interface ItemModelDto {
  itemModelId: number
  name: string
  vendorId: number
  vendorName: string
  itemCategoryId: number
  itemCategoryName: string
  itemProperties: ItemPropertyDto[]
  actionDefinitions: ActionDefinitionDto[]
}

// ─── Home Management ─────────────────────────────────────────────────────────

export interface ItemStateDto {
  itemStateId: number
  actionDefinitionId: number
  actionDefinitionName: string
  controllable: boolean
  valueType: string
  value: unknown
}

export interface ItemDto {
  itemId: number
  name: string
  roomId: number
  itemModelId: number
  itemModelName: string
  itemCategoryName: string
  itemStates: ItemStateDto[]
}

export interface RoomDto {
  roomId: number
  name: string
  unitId: number
  roomTypeId: number
  roomTypeName: string
  items: ItemDto[]
}

export interface UnitDto {
  unitId: number
  name: string
  userId: number
  unitTypeId: number
  unitTypeName: string
  rooms: RoomDto[]
}

// ─── Smart Workflow ───────────────────────────────────────────────────────────

export interface SmartActionDto {
  smartActionId: number
  itemStateId?: number | null
  itemName?: string | null
  itemCategoryName?: string | null
  actionDefinitionName?: string | null
  valueType?: string | null
  value: unknown
  targetSceneId?: number | null
  targetSceneName?: string | null
}

export interface SceneDto {
  sceneId: number
  name: string
  userId: number
  smartActions: SmartActionDto[]
}

export interface AutomationTriggerDto {
  automationTriggerId: number
  triggerType: string
  valueType: string
  value: unknown
  operand?: string | null
  itemStateId?: number | null
  itemName?: string | null
  actionDefinitionName?: string | null
  itemCategoryName?: string | null
}

export interface AutomationDto {
  automationId: number
  name: string
  userId: number
  triggers: AutomationTriggerDto[]
  smartActions: SmartActionDto[]
}

// ─── Action / Logs ────────────────────────────────────────────────────────────

export interface ActionLogDto {
  actionLogId: number
  executionId: string
  timestamp: string
  triggerSource: unknown
  pastValue: unknown
  currentValue: unknown
  itemStateId?: number | null
  smartWorkflowId?: number | null
}

// ─── AI Agent ─────────────────────────────────────────────────────────────────

export interface ProposalDto {
  type: string
  payload: unknown
}

export interface AgentMessageDto {
  role: string
  content: string
  timestamp: string
  proposal?: ProposalDto | null
}

export interface ChatMessageRequest {
  message: string
}

export interface ApplyProposalRequest {
  type: string
  payload: unknown
}
