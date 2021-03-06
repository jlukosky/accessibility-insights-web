// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { configuration } from './custom-rule-configurations';
import { RuleConfiguration } from './iruleresults';

export class HelpUrlGetter {
    constructor(private readonly ruleConfigs: RuleConfiguration[]) {}

    public getlHelpUrl(ruleId: string, axeHelpUrl: string): string {
        const customHelpUrl = this.getCustomHelpUrl(ruleId);
        return customHelpUrl || axeHelpUrl;
    }

    private getCustomHelpUrl(ruleId: string): string {
        for (let index = 0; index < this.ruleConfigs.length; index++) {
            const config = this.ruleConfigs[index];
            if (config.rule.id === ruleId && config.rule.helpUrl != null) {
                return config.rule.helpUrl;
            }
        }

        return null;
    }
}
