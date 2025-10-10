126,141c\
  private loadContactClassifications(): Promise<void> {\
    return new Promise((resolve) => {\
      let url = \`\${this.classificationsUrl}/tenants/\${this.currentTenantId}/classifications/type/CONTACT_RESULT\`;\
      if (this.currentPortfolioId) {\
        url += \`?portfolioId=\${this.currentPortfolioId}\`;\
      }\
      this.http.get<any[]>(url).pipe(\
        tap(configs => {\
          const classifications = configs.map(config => ({\
            id: config.classification.id,\
            code: config.classification.code,\
            label: config.classification.name,\
            isSuccessful: config.classification.metadataSchema?.includes('"isSuccessful":true') || false\
          }));\
          this.contactClassifications.set(classifications);\
          console.log('✅ Tipificaciones contacto (filtradas):', classifications.length);\
        }),\
        catchError(error => {\
          console.warn('⚠️ Error cargando tipificaciones de contacto, usando fallback', error);\
          return of([]);\
        })\
      ).subscribe(() => resolve());\
    });\
  }
146,161c\
  private loadManagementClassifications(): Promise<void> {\
    return new Promise((resolve) => {\
      let url = \`\${this.classificationsUrl}/tenants/\${this.currentTenantId}/classifications/type/MANAGEMENT_TYPE\`;\
      if (this.currentPortfolioId) {\
        url += \`?portfolioId=\${this.currentPortfolioId}\`;\
      }\
      this.http.get<any[]>(url).pipe(\
        tap(configs => {\
          const classifications = configs.map(config => {\
            const metadata = config.classification.metadataSchema || '{}';\
            return {\
              id: config.classification.id,\
              code: config.classification.code,\
              label: config.classification.name,\
              requiresPayment: metadata.includes('"requiresPayment":true'),\
              requiresSchedule: metadata.includes('"requiresSchedule":true'),\
              requiresFollowUp: metadata.includes('"requiresFollowUp":true'),\
              parentId: config.classification.parentClassificationId,\
              hierarchyLevel: config.classification.hierarchyLevel\
            };\
          });\
          this.managementClassifications.set(classifications);\
          console.log('✅ Tipificaciones gestión (filtradas):', classifications.length);\
        }),\
        catchError(error => {\
          console.warn('⚠️ Error cargando tipificaciones de gestión, usando fallback', error);\
          return of([]);\
        })\
      ).subscribe(() => resolve());\
    });\
  }
