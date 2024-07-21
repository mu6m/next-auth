import { Card, CardHeader, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export default async function Comp() {
	const cat = await prisma.category.findMany({
		include: {
			products: {
				take: 9,
				orderBy: {
					createdAt: "desc",
				},
			},
		},
	});
	const non_cat = await prisma.product.findMany({
		where: {
			categoryId: null,
		},
		take: 9,
		orderBy: {
			createdAt: "desc",
		},
	});
	return (
		<>
			<main className="flex flex-col items-center mx-auto w-full max-w-7xl">
				<section className="w-full py-12 md:py-24 lg:py-32 ">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
									New Products
								</h2>
							</div>
							{non_cat.length == 0 && <p className="text-lg ">No Products</p>}
							{non_cat.length > 0 && (
								<a
									className="font-bold text-sm ml-auto underline"
									href={`/category/`}
								>
									View All {">"}
								</a>
							)}
						</div>
						<div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
							{non_cat.map((item: any) => {
								return (
									<Card className="group">
										<a href={`/product/${item.id}`}>
											<CardHeader>
												<img
													src={item.images[0]}
													width="300"
													height="200"
													alt={item.title}
													className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
												/>
											</CardHeader>
											<CardContent>
												<div className="space-y-1">
													<h3 className="text-lg font-bold">{item.title}</h3>
													<p className="text-muted-foreground">
														{item.price <= 0 ? "FREE" : item.price}
													</p>
												</div>
											</CardContent>
										</a>
									</Card>
								);
							})}
						</div>
					</div>
					{cat.map((item: any) => {
						return (
							<div className="container px-4 md:px-6">
								<div className="flex flex-col items-center justify-center space-y-4 text-center">
									<div className="space-y-2">
										<h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
											{item.name}
										</h2>
										{item.products.length == 0 && (
											<p className="text-lg ">No Products</p>
										)}
									</div>
									{item.products.length > 0 && (
										<a
											className="font-bold text-sm ml-auto underline"
											href={`/category/${item.id}`}
										>
											View All {">"}
										</a>
									)}
								</div>
								<div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
									{item.products.map((product: any) => {
										return (
											<Card className="group">
												<a href={`/product/${product.id}`}>
													<CardHeader>
														<img
															src={product.images[0]}
															width="300"
															height="200"
															alt={product.title}
															className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
														/>
													</CardHeader>
													<CardContent>
														<div className="space-y-1">
															<h3 className="text-lg font-bold">
																{product.title}
															</h3>
															<p className="text-muted-foreground">
																{product.price <= 0 ? "FREE" : product.price}
															</p>
														</div>
													</CardContent>
												</a>
											</Card>
										);
									})}
								</div>
							</div>
						);
					})}
				</section>
			</main>
		</>
	);
}
