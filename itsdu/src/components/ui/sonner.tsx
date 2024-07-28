import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			richColors
			className="toaster group"
			visibleToasts={4}
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
					description: "group-[.toast]:!text-muted-foreground",
					actionButton:
						"group-[.toast]:!bg-success-600 group-[.toast]:!text-success-foreground",
					cancelButton:
						"group-[.toast]:!bg-muted group-[.toast]:!text-muted-foreground",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
