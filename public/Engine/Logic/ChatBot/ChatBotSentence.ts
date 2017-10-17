﻿class ChatBotSentence implements ChatBotSentenceInterface
{
    public Conditions: DialogCondition[] = [];
    public Trigger: string = "[hello,@bot@],[hi,@bot@],[hey,@bot@]";
    public Answer: string = "Hi @name@";
    public Code: string = "// Uncomment the following function if you want to override\n// the answer with an answer generated by code.\n\n// function Answer(line)\n// {\n// \treturn \"Hello\";\n// }";
    public FollowUp: boolean;

    private triggerWords: string[][];
    private env: CodeEnvironement;

    public Store(): ChatBotSentenceInterface
    {
        return {
            Conditions: this.Conditions,
            Trigger: this.Trigger,
            Answer: this.Answer,
            Code: this.Code,
            FollowUp: this.FollowUp
        };
    }

    public HandleChat(botName: string, followUp: boolean, line: string, callback: (result: string) => void): void
    {
        if (!this.triggerWords)
            this.triggerWords = this.SplitTrigger();
        var words = ChatBotSentence.SplitLine(line);
        if (followUp && this.FollowUp)
            words.push(botName.toLowerCase());
        if (this.Match(botName.toLowerCase(), words))
        {
            this.env = CodeParser.Parse(this.Code);
            if (this.env.HasFunction("Answer"))
            {
                this.env.ExecuteFunction("Answer", [new VariableValue(line)], (res) => { callback(res.GetString()); });
                return;
            }
            else
            {
                callback(this.Answer.replace(/@name@/gi, username));
                return;
            }
        }
        callback(null);
    }

    private Match(botName: string, words: string[]): boolean
    {
        for (var i = 0; i < this.triggerWords.length; i++)
        {
            var nbMatched = 0;
            for (var j = 0; j < this.triggerWords[i].length; j++)
            {
                for (var k = 0; k < words.length; k++)
                {
                    if (this.triggerWords[i][j] == "@bot@" && words[k] == botName || this.triggerWords[i][j] == words[k])
                    {
                        nbMatched++;
                        break;
                    }
                }
            }
            if (nbMatched == this.triggerWords[i].length)
                return true;
        }
        return false;
    }

    public static SplitLine(line: string): string[]
    {
        var res = line.toLowerCase().split(/\W+/);
        if (line.indexOf("/") == 0 && res && res.length > 1)
        {
            res.shift();
            res[0] = "/" + res[0];
        }
        return res;
    }

    private SplitTrigger()
    {
        return ChatBotSentence.SplitRules(this.Trigger);
    }

    public static SplitRules(source: string)
    {
        var triggerWords: string[][] = [];
        var possibleSentence: string[] = null;
        var currentWord = "";
        for (var i = 0; i < source.length; i++)
        {
            var c = source[i].toLowerCase();
            if ((c >= "a" && c <= "z") || c == "@" || (c == "/" && currentWord == "" && triggerWords.length == 0 && possibleSentence == null))
                currentWord += c;
            else if (c == ",")
            {
                if (!possibleSentence)
                {
                    if (currentWord && currentWord != "")
                    {
                        triggerWords.push([currentWord]);
                        currentWord = "";
                    }
                }
                else
                {
                    possibleSentence.push(currentWord);
                    currentWord = "";
                }
            }
            else if (c == "]")
            {
                possibleSentence.push(currentWord);
                currentWord = "";
                triggerWords.push(possibleSentence);
                possibleSentence = null;
            }
            else if (c == "[")
            {
                possibleSentence = [];
            }
        }
        if (currentWord != "")
        {
            if (possibleSentence)
            {
                possibleSentence.push(currentWord);
                triggerWords.push(possibleSentence);
            }
            else
                triggerWords.push([currentWord]);
        }
        return triggerWords;
    }

    public ResetLogic()
    {
        this.triggerWords = null;
        this.env = null;
    }
}