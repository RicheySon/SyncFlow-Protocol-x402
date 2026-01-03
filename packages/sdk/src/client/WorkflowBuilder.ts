export class WorkflowBuilder {
    private steps: any[] = [];
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    addStep(type: 'ACTION' | 'CONDITION' | 'DELAY', params: any) {
        this.steps.push({
            id: `step-${this.steps.length + 1}`,
            type,
            params
        });
        return this;
    }

    addDelay(ms: number) {
        return this.addStep('DELAY', { durationMs: ms });
    }

    addAction(agentId: string, actionType: string, params: any) {
        return this.addStep('ACTION', {
            targetAgentId: agentId,
            actionType,
            ...params
        });
    }

    build() {
        return {
            name: this.name,
            steps: this.steps
        };
    }
}
