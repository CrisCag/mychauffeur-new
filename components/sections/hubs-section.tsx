import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Messages } from "@/messages/types";

type HubsSectionProps = {
  dict: Messages;
};

export function HubsSection({ dict }: HubsSectionProps) {
  const h = dict.hubsSection;

  return (
    <section className="border-t border-border/40 py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            {h.kicker}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {h.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{h.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {h.groups.map((group) => (
            <Card key={group.title} className="border-border/70 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{group.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {group.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
