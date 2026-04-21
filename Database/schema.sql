-- ============================================================
-- Houseleek Schema
-- ============================================================

DROP SCHEMA IF EXISTS houseleek CASCADE;
CREATE SCHEMA houseleek;

SET search_path TO houseleek;

-- ============================================================
-- LOOKUP / TYPE TABLES
-- ============================================================

CREATE TABLE unit_type (
    unit_type_id    INT         PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name            VARCHAR     NOT NULL
);

CREATE TABLE room_type (
    room_type_id    INT         PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name            VARCHAR     NOT NULL
);

CREATE TABLE item_category (
    item_category_id    INT         PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name                VARCHAR     NOT NULL
);

-- ============================================================
-- ABSTRACT USER + SUBTYPES
-- ============================================================

CREATE TABLE abstract_user (
    user_id     INT         PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email       VARCHAR     NOT NULL,
    password    VARCHAR     NOT NULL,
    CONSTRAINT uq_abstract_user_id      UNIQUE (user_id),
    CONSTRAINT uq_abstract_user_email   UNIQUE (email),
    CONSTRAINT chk_abstract_user_email  CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

CREATE TABLE admin (
    user_id     INT         PRIMARY KEY,
    name        VARCHAR     NOT NULL,
    surname     VARCHAR     NOT NULL,
    CONSTRAINT fk_admin_abstract_user FOREIGN KEY (user_id)
        REFERENCES abstract_user (user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE "user" (
    user_id     INT         PRIMARY KEY,
    name        VARCHAR     NOT NULL,
    surname     VARCHAR     NOT NULL,
    CONSTRAINT fk_user_abstract_user FOREIGN KEY (user_id)
        REFERENCES abstract_user (user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE vendor (
    user_id         INT         PRIMARY KEY,
    name            VARCHAR     NOT NULL,
    pseudonym       VARCHAR     NOT NULL,
    CONSTRAINT fk_vendor_abstract_user FOREIGN KEY (user_id)
        REFERENCES abstract_user (user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================================
-- UNIT + ROOM
-- ============================================================

CREATE TABLE unit (
    unit_id         INT         PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name            VARCHAR     NOT NULL,
    user_id         INT         NOT NULL,
    unit_type_id    INT         NOT NULL,
    CONSTRAINT uq_unit_id               UNIQUE (unit_id),
    CONSTRAINT fk_unit_user             FOREIGN KEY (user_id)
        REFERENCES "user" (user_id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,
    CONSTRAINT fk_unit_unit_type        FOREIGN KEY (unit_type_id)
        REFERENCES unit_type (unit_type_id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

CREATE TABLE room (
    room_id         INT         PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name            VARCHAR     NOT NULL,
    unit_id         INT         NOT NULL,
    room_type_id    INT         NOT NULL,
    CONSTRAINT uq_room_id               UNIQUE (room_id),
    CONSTRAINT fk_room_unit             FOREIGN KEY (unit_id)
        REFERENCES unit (unit_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_room_room_type        FOREIGN KEY (room_type_id)
        REFERENCES room_type (room_type_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================================
-- ITEM MODEL + PROPERTIES + ACTION DEFINITIONS
-- ============================================================

CREATE TABLE item_model (
    item_model_id       INT         PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name                VARCHAR     NOT NULL,
    published           BOOLEAN     NOT NULL DEFAULT FALSE,
    vendor_id           INT         NOT NULL,
    item_category_id    INT         NOT NULL,
    CONSTRAINT uq_item_model_id             UNIQUE (item_model_id),
    CONSTRAINT fk_item_model_vendor         FOREIGN KEY (vendor_id)
        REFERENCES vendor (user_id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,
    CONSTRAINT fk_item_model_item_category  FOREIGN KEY (item_category_id)
        REFERENCES item_category (item_category_id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

CREATE TABLE item_property (
    item_property_id    INT         NOT NULL GENERATED ALWAYS AS IDENTITY,
    item_model_id       INT         NOT NULL,
    name                VARCHAR     NOT NULL,
    value               TEXT,
    CONSTRAINT pk_item_property             PRIMARY KEY (item_property_id, item_model_id),
    CONSTRAINT fk_item_property_item_model  FOREIGN KEY (item_model_id)
        REFERENCES item_model (item_model_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE action_definition (
    action_definition_id    INT         NOT NULL GENERATED ALWAYS AS IDENTITY,
    item_model_id           INT         NOT NULL,
    name                    VARCHAR     NOT NULL,
    controllable            BOOLEAN     NOT NULL,
    value_type              VARCHAR     NOT NULL,
    default_value           VARCHAR     NOT NULL,
    min_value               DOUBLE PRECISION,
    max_value               DOUBLE PRECISION,
    CONSTRAINT pk_action_definition             PRIMARY KEY (action_definition_id, item_model_id),
    CONSTRAINT uq_action_definition_id          UNIQUE (action_definition_id),
    CONSTRAINT chk_action_definition_value_type CHECK (value_type IN ('string', 'int', 'double', 'bool')),
    CONSTRAINT chk_action_definition_min_max    CHECK ((value_type IN ('int', 'double')) OR (min_value IS NULL AND max_value IS NULL)),
    CONSTRAINT fk_action_definition_item_model  FOREIGN KEY (item_model_id)
        REFERENCES item_model (item_model_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================================
-- ITEM + ITEM STATE
-- ============================================================

CREATE TABLE item (
    item_id         INT         PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name            VARCHAR     NOT NULL,
    item_model_id   INT         NOT NULL,
    room_id         INT         NOT NULL,
    CONSTRAINT uq_item_id               UNIQUE (item_id),
    CONSTRAINT fk_item_item_model       FOREIGN KEY (item_model_id)
        REFERENCES item_model (item_model_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_item_room             FOREIGN KEY (room_id)
        REFERENCES room (room_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE item_state (
    item_state_id           INT         NOT NULL GENERATED ALWAYS AS IDENTITY,
    action_definition_id    INT         NOT NULL,
    item_id                 INT         NOT NULL,
    value                   VARCHAR     NOT NULL,
    CONSTRAINT pk_item_state                PRIMARY KEY (item_state_id, action_definition_id, item_id),
    CONSTRAINT uq_item_state_id             UNIQUE (item_state_id),
    CONSTRAINT fk_item_state_action_def     FOREIGN KEY (action_definition_id)
        REFERENCES action_definition (action_definition_id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT,
    CONSTRAINT fk_item_state_item           FOREIGN KEY (item_id)
        REFERENCES item (item_id)
        ON UPDATE RESTRICT
        ON DELETE CASCADE
);

-- ============================================================
-- SMART WORKFLOW + SUBTYPES
-- ============================================================

CREATE TABLE smart_workflow (
    smart_workflow_id   INT         PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    type                VARCHAR     NOT NULL,
    name                VARCHAR     NOT NULL,
    user_id             INT         NOT NULL,
    CONSTRAINT uq_smart_workflow_id         UNIQUE (smart_workflow_id),
    CONSTRAINT chk_smart_workflow_type      CHECK (type IN ('automation', 'scene')),
    CONSTRAINT fk_smart_workflow_user       FOREIGN KEY (user_id)
        REFERENCES "user" (user_id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

CREATE TABLE scene (
    scene_id    INT         PRIMARY KEY,
    CONSTRAINT fk_scene_smart_workflow FOREIGN KEY (scene_id)
        REFERENCES smart_workflow (smart_workflow_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE automation (
    automation_id   INT         PRIMARY KEY,
    CONSTRAINT fk_automation_smart_workflow FOREIGN KEY (automation_id)
        REFERENCES smart_workflow (smart_workflow_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ============================================================
-- SMART ACTION
-- ============================================================

CREATE TABLE smart_action (
    smart_action_id     INT         NOT NULL GENERATED ALWAYS AS IDENTITY,
    smart_workflow_id   INT         NOT NULL,
    value               VARCHAR,
    item_state_id       INT,
    target_scene_id     INT,
    CONSTRAINT pk_smart_action              PRIMARY KEY (smart_action_id, smart_workflow_id),
    CONSTRAINT uq_smart_action_id           UNIQUE (smart_action_id),
    CONSTRAINT chk_smart_action_target      CHECK (
        (target_scene_id IS NOT NULL AND item_state_id IS NULL AND value IS NULL) OR
        (target_scene_id IS NULL AND item_state_id IS NOT NULL AND value IS NOT NULL)
    ),
    CONSTRAINT fk_smart_action_workflow     FOREIGN KEY (smart_workflow_id)
        REFERENCES smart_workflow (smart_workflow_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_smart_action_item_state   FOREIGN KEY (item_state_id)
        REFERENCES item_state (item_state_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_smart_action_scene        FOREIGN KEY (target_scene_id)
        REFERENCES scene (scene_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================================
-- AUTOMATION TRIGGER
-- ============================================================

CREATE TABLE automation_trigger (
    automation_trigger_id   INT         NOT NULL GENERATED ALWAYS AS IDENTITY,
    automation_id           INT         NOT NULL,
    trigger_type            VARCHAR     NOT NULL,
    value_type              VARCHAR     NOT NULL,
    value                   VARCHAR     NOT NULL,
    operand                 VARCHAR,
    item_state_id           INT,
    CONSTRAINT pk_automation_trigger            PRIMARY KEY (automation_trigger_id, automation_id),
    CONSTRAINT uq_automation_trigger_id         UNIQUE (automation_trigger_id),
    CONSTRAINT chk_automation_trigger_type      CHECK (trigger_type IN ('state-driven', 'time-driven')),
    CONSTRAINT chk_automation_trigger_val_type  CHECK (value_type IN ('string', 'int', 'double', 'bool', 'DateTime')),
    CONSTRAINT chk_automation_trigger_operand   CHECK (operand IN ('<', '>', '=')),
    CONSTRAINT fk_automation_trigger_automation FOREIGN KEY (automation_id)
        REFERENCES automation (automation_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_automation_trigger_item_state FOREIGN KEY (item_state_id)
        REFERENCES item_state (item_state_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================================
-- ACTION LOG
-- ============================================================

CREATE TABLE action_log (
    action_log_id       INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    execution_id        UUID            NOT NULL,
    timestamp           TIMESTAMPTZ     NOT NULL,
    trigger_source      JSONB           NOT NULL,
    past_value          VARCHAR         NOT NULL,
    current_value       VARCHAR         NOT NULL,
    item_state_id       INT,
    smart_workflow_id   INT,
    CONSTRAINT uq_action_log_id             UNIQUE (action_log_id),
    CONSTRAINT fk_action_log_item_state     FOREIGN KEY (item_state_id)
        REFERENCES item_state (item_state_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_action_log_smart_workflow FOREIGN KEY (smart_workflow_id)
        REFERENCES smart_workflow (smart_workflow_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- ============================================================
-- AGENT ROLE GRANTS
-- ============================================================

-- davanju agenta read-only pristup
GRANT USAGE ON SCHEMA houseleek TO thesis_agent;
GRANT SELECT ON ALL TABLES IN SCHEMA houseleek TO thesis_agent;
-- suspenzija agenta sa tabela sa privatnim informacijama
REVOKE SELECT ON houseleek.abstract_user FROM thesis_agent;
REVOKE SELECT ON houseleek.admin FROM thesis_agent;
REVOKE SELECT ON houseleek."user" FROM thesis_agent;