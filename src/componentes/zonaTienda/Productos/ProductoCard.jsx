function imageSource(images) {
  const image = Array.isArray(images) ? images[0] : images
  if (!image || typeof image !== 'string') return ''
  return image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
}

function ProductoCard({ product }) {
  const name = product.nombre ?? product.name ?? 'Producto'
  const image = imageSource(product.imagenes ?? product.imagen ?? product.image)
  const rating = product.valoracionMedia ?? product.rating
  const opinions = product.numeroOpiniones ?? product.reviewCount
  const hasRating = rating != null && rating !== '' && Number.isFinite(Number(rating))
  const priceValue = product.precio ?? product.price
  const price = priceValue == null || priceValue === '' ? Number.NaN : Number(priceValue)

  return (
    <article className="product-card">
      <div className="product-card-image">
        {image ? <img src={image} alt={name} loading="lazy" /> : <span>Sin imagen</span>}
      </div>
      <div className="product-card-content">
        {product.marca && <p className="product-brand">{product.marca}</p>}
        <h2>{name}</h2>
        {product.disponible === false && <p className="product-availability" role="status">No disponible</p>}
        {hasRating && <p className="product-rating" aria-label={`Valoración ${Number(rating).toFixed(1)} de 5`}>
          <span aria-hidden="true">★</span> {Number(rating).toFixed(1)}{opinions != null && <span className="product-opinions"> ({opinions})</span>}
        </p>}
        {Number.isFinite(price) && <p className="product-price">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)}</p>}
      </div>
    </article>
  )
}

export default ProductoCard
