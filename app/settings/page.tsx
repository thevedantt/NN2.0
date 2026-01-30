"use client"

import * as React from "react"
import { useLanguage } from "@/context/LanguageContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Globe } from "lucide-react"

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage()

    return (
        <div className="container max-w-4xl py-6 space-y-8">
            <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold tracking-tight">{t("settings_title")}</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>{t("settings_language_title")}</CardTitle>
                    </div>
                    <CardDescription>
                        {t("settings_language_desc")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        defaultValue={language}
                        onValueChange={(val) => setLanguage(val as any)}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div>
                            <RadioGroupItem value="en" id="lang-en" className="peer sr-only" />
                            <Label
                                htmlFor="lang-en"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <span className="text-lg font-semibold">A</span>
                                <span className="mt-2 text-sm font-medium">{t("lang_en")}</span>
                            </Label>
                        </div>

                        <div>
                            <RadioGroupItem value="hi" id="lang-hi" className="peer sr-only" />
                            <Label
                                htmlFor="lang-hi"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <span className="text-lg font-semibold">अ</span>
                                <span className="mt-2 text-sm font-medium">{t("lang_hi")}</span>
                            </Label>
                        </div>

                        <div>
                            <RadioGroupItem value="mr" id="lang-mr" className="peer sr-only" />
                            <Label
                                htmlFor="lang-mr"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <span className="text-lg font-semibold">म</span>
                                <span className="mt-2 text-sm font-medium">{t("lang_mr")}</span>
                            </Label>
                        </div>


                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
    )
}
