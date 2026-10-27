"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const schema = z.object({
  name: z.string().trim().min(2, "Informe ao menos 2 caracteres"),
});

type FormData = z.infer<typeof schema>;

type NameFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  initialName?: string;
  submitting?: boolean;
  onSubmit: (name: string) => void;
};

export function NameFormDialog({
  open,
  onOpenChange,
  title,
  description,
  label = "Nome",
  placeholder,
  initialName = "",
  submitting = false,
  onSubmit,
}: NameFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName },
  });

  useEffect(() => {
    if (open) reset({ name: initialName });
  }, [open, initialName, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <form
          id="name-form"
          onSubmit={handleSubmit((data) => onSubmit(data.name.trim()))}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">{label}</FieldLabel>
              <Input
                id="name"
                placeholder={placeholder}
                autoFocus
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="name-form"
            disabled={submitting}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {submitting ? <Spinner /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
