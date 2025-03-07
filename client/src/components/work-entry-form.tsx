import React, { useContext, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertWorkEntrySchema, type InsertWorkEntry } from "@shared/schema";
import { LanguageContext } from "../App";
import { SignaturePad } from "./signature-pad";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { ru, uk, cs } from "date-fns/locale";

const locales = {
  ru,
  uk,
  cs
};

export function WorkEntryForm() {
  const { t, language } = useContext(LanguageContext);
  const { toast } = useToast();

  const form = useForm<InsertWorkEntry>({
    resolver: zodResolver(insertWorkEntrySchema),
    defaultValues: {
      date: new Date(),
      breakDuration: 0,
      hourlyRate: 0,
      totalHours: "0",
      totalAmount: "0"
    }
  });

  useEffect(() => {
    const currentValues = form.getValues();
    // Reset form with current values to trigger re-render with new language
    form.reset({
      ...currentValues,
      date: currentValues.date ? new Date(currentValues.date) : new Date(),
      startTime: currentValues.startTime ? new Date(currentValues.startTime) : undefined,
      endTime: currentValues.endTime ? new Date(currentValues.endTime) : undefined,
      breakDuration: currentValues.breakDuration || 0,
      hourlyRate: currentValues.hourlyRate || 0,
      totalHours: currentValues.totalHours || "0",
      totalAmount: currentValues.totalAmount || "0"
    });
  }, [language, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertWorkEntry) => {
      await apiRequest("POST", "/api/work-entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-entries"] });
      toast({
        title: "Success",
        description: "Work entry saved successfully"
      });
      form.reset();
    }
  });

  const onSubmit = (data: InsertWorkEntry) => {
    mutation.mutate(data);
  };

  const calculateTotals = () => {
    const startTime = form.watch("startTime");
    const endTime = form.watch("endTime");
    const breakDuration = form.watch("breakDuration");
    const hourlyRate = form.watch("hourlyRate");

    if (!startTime || !endTime) return;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalMinutes = (end.getTime() - start.getTime()) / 1000 / 60 - breakDuration;
    const totalHours = (totalMinutes / 60).toFixed(2);
    const totalAmount = (Number(totalHours) * hourlyRate).toFixed(2);

    form.setValue("totalHours", totalHours);
    form.setValue("totalAmount", totalAmount);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.date}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.eventName}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.eventLocation}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.description}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.startTime}</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => {
                      field.onChange(new Date(e.target.value));
                      calculateTotals();
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.endTime}</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => {
                      field.onChange(new Date(e.target.value));
                      calculateTotals();
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="breakDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.breakDuration}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                      calculateTotals();
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.hourlyRate}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                      calculateTotals();
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.totalHours}</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.totalAmount}</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">{t.form.signature}</h3>
          <SignaturePad
            onChange={(signature) => form.setValue("signature", signature)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {t.form.submit}
          </Button>
        </div>
      </form>
    </Form>
  );
}