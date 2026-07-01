from sqlalchemy import Select
from sqlalchemy.inspection import inspect
from fastapi import HTTPException 
from pydantic import BaseModel, Field, model_validator
from enum import Enum
from typing import Any


MAX_FILTERS = 10          # nº máximo de filtros por petición
MAX_FILTER_ERROR = (
    f"Maximum {MAX_FILTERS} filters are allowed."
)

UNKNOWN_FIELD_ERROR = (
    "Unknown filter field."
)

INVALID_OPERATOR_ERROR = (
    "Unsupported operator."
)

class FilterOperator(str, Enum):
    EQ = "="
    NE = "!="
    GT = ">"
    LT = "<"
    LIKE = "like"
    IN = "in"
    IS_NULL = "is null"

OPERATORS = {
    FilterOperator.EQ: lambda c, v: c == v,
    FilterOperator.NE: lambda c, v: c != v,
    FilterOperator.GT: lambda c, v: c > v,
    FilterOperator.LT: lambda c, v: c < v,
    FilterOperator.LIKE: lambda c, v: c.like(v),
    FilterOperator.IN: lambda c, v: c.in_(v),
    FilterOperator.IS_NULL: lambda c, _: c.is_(None),
}
 
#Clases para el modelo de filtros i operadores permitidos



class FilterCondition(BaseModel):
  field: str
  operator: FilterOperator
  value: Any | None = None
    
  @model_validator(mode="after")
  def validate_value(self):

      if self.operator == FilterOperator.IS_NULL and self.value is not None:
          raise ValueError(
              "IS NULL operator cannot receive a value."
          )
      return self
class SearchFilters(BaseModel):
    filters: list[FilterCondition] = Field(default_factory=list) 
    
def allowed_columns(model: type[Any]) -> dict[str, Any]:
    mapper = inspect(model)
    return {
        column.key: getattr(model, column.key)
        for column in mapper.columns
    }    
    

    
# SECTION: Modelos filtrados

class ItemFilterField(str, Enum):
    ID = "id"
    SKU = "sku"
    STATUS = "status"
    WAREHOUSE_ID = "warehouse_id"
    CREATED_AT = "created_at"
    
class ItemFilter(FilterCondition):
    field: ItemFilterField
    
class ItemSearchFilters(SearchFilters):
    filters: list[ItemFilter]




def apply_filters(
    stmt: Select,
    model: type[Any],
    filters: SearchFilters | None,
) -> Select:

    if not filters:
        return stmt

    if len(filters.filters) > MAX_FILTERS:
        raise HTTPException(
            status_code=400,
            detail=MAX_FILTER_ERROR
        )

    columns = allowed_columns(model)

    for condition in filters.filters:

        if condition.field.value not in columns:
            raise HTTPException(
                status_code=400,
                detail=UNKNOWN_FIELD_ERROR
            )

        operator = OPERATORS.get(condition.operator)

        if operator is None:
            raise HTTPException(
                status_code=400,
                detail=INVALID_OPERATOR_ERROR
            )

        stmt = stmt.where(
            operator(
                columns[condition.field.value],
                condition.value
            )
        )

    return stmt