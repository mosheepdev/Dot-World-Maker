﻿/// <reference path="../Dialogs/DialogCondition.ts" />

@DialogConditionClass
class CheckQuestNotCompleted extends ConditionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(c => c.Name).sort(), values[0], updateFunction);
        return html;
    }

    public Check(values: string[], env?: CodeEnvironement): boolean
    {
        if (!values[0])
            throw "The condition 'Check Quest Not Completed' requires a quest name.";

        return !world.Player.IsQuestCompleted(values[0]);
    }
}